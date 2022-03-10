import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry } from '../../../../../../openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { replaceUmlaute, decodeXml } from '../../../../../shares/utils';

export class ProductContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');
  public collapsed = false;

  public pageEntry: PageEntry | undefined;

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private disciplineSubscription: Subscription = new Subscription();
  private productSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();
  private navigationSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private disciplineId = '';
  private productId = '';
  private projectFeatures = [];

  private menuEntries = [];

  public onInit(): void {
    const paramId = this.pageEntry?.id || '1';

    this.pageEntry = this.getPageEntryContent(paramId);

    this.metaModelVariantSubscription = this.projekthandbuchService
      .getModelVariantId()
      .subscribe((modelVariantsId: string) => {
        this.modelVariantsId = modelVariantsId;
      });

    this.navigationSubscription = this.projekthandbuchService.getNavigationData().subscribe((menuEntries: []) => {
      this.menuEntries = menuEntries;
    });

    this.projectTypeSubscription = this.projekthandbuchService.getProjectTypeId().subscribe((projectTypeId: string) => {
      this.projectTypeId = projectTypeId;
    });

    this.projectTypeVariantSubscription = this.projekthandbuchService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId: string) => {
        this.projectTypeVariantId = projectTypeVariantId;
      });

    this.disciplineSubscription = this.projekthandbuchService.getDisciplineId().subscribe((disciplineId: string) => {
      this.disciplineId = disciplineId;
    });

    this.productSubscription = this.projekthandbuchService.getProductId().subscribe((productId: string) => {
      if (productId !== '') {
        this.productId = productId;
      }
    });

    this.projectFeaturesSubscription = this.projekthandbuchService
      .getProjectFeatureValues()
      .subscribe((projectFeatures: []) => {
        this.projectFeatures = projectFeatures;
      });
  }

  public async getContent(): Promise<any> {
    const url =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Disziplin/' +
      this.disciplineId +
      '/Produkt/' +
      this.productId +
      '?' +
      this.getProjectFeaturesString();

    let idCounter = 2000;

    return axios.get(url).then((response) => {
      const jsonDataFromXml = new XMLParser().parseFromString(
        replaceUmlaute(response.data),
        'application/xml'
      ) as Document;

      const sinnUndZweck: any = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
      const rolleVerantwortetProduktRef: any = jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRef');
      const rolleWirktMitBeiProduktRef: any = jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRef');
      const produktZuEntscheidungspunktRef: any = jsonDataFromXml.getElementsByTagName(
        'ProduktZuEntscheidungspunktRef'
      );
      const themaZuProduktRef: any = jsonDataFromXml.getElementsByTagName('ThemaZuProduktRef');
      const aktivitaetRef: any = jsonDataFromXml.getElementsByTagName('AktivitaetZuProduktRef');
      const externeKopiervorlageZuProduktRef: any = jsonDataFromXml.getElementsByTagName(
        'ExterneKopiervorlageZuProduktRef'
      );

      const tableEntries = [];
      // const subPageEntries = [];

      //////////////////////////////////////////////

      const rolesInCharge = rolleVerantwortetProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('RolleRef').map((roleRef) => {
          return {
            menuEntryId: roleRef.attributes.id,
            title: roleRef.attributes.name,
          };
        });
      });

      if (rolesInCharge.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Verantwortlich', //rolleVerantwortetProduktRef[0]?.attributes.name,
          dataEntries: rolesInCharge,
        });
      }

      //////////////////////////////////////////////

      const rolesTakePart = rolleWirktMitBeiProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('RolleRef').map((roleRef) => {
          return {
            menuEntryId: roleRef.attributes.id,
            title: roleRef.attributes.name,
          };
        });
      });

      if (rolesTakePart.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Mitwirkend', //rolleWirktMitBeiProduktRef[0]?.attributes.name,
          dataEntries: rolesTakePart,
        });
      }

      //////////////////////////////////////////////

      const activities = aktivitaetRef.flatMap((entry) => {
        return entry.getElementsByTagName('AktivitaetRef').map((activityRef) => {
          return {
            id: activityRef.attributes.id,
            menuEntryId: activityRef.attributes.id,
            title: activityRef.attributes.name,
            suffix: '(Aktivität)',
          };
        });
      });

      const products = externeKopiervorlageZuProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('ExterneKopiervorlageRef').map((productRef) => {
          return {
            menuEntryId: productRef.attributes.id,
            title: productRef.attributes.name,
            suffix: '(Externe Kopiervorlage)',
          };
        });
      });

      const tools = [...activities, ...products];
      // console.log('Tools', tools);

      if (tools.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Hilfsmittel', //produktZuEntscheidungspunktRef[0]?.attributes.name,
          dataEntries: tools,
        });
      }

      //////////////////////////////////////////////

      const decisionPoints = produktZuEntscheidungspunktRef.flatMap((entry) => {
        return entry.getElementsByTagName('EntscheidungspunktRef').map((decisionPointRef) => {
          return {
            menuEntryId: decisionPointRef.attributes.id,
            title: decisionPointRef.attributes.name,
          };
        });
      });

      if (decisionPoints.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Entscheidungsrelevant bei', //produktZuEntscheidungspunktRef[0]?.attributes.name,
          dataEntries: decisionPoints,
        });
      }

      //////////////////////////////////////////////
      // +++++++++++++++++++++++++++++++++++++++++++
      //////////////////////////////////////////////
      const subPageEntries = themaZuProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('ThemaRef').map((subjectRef) => {
          return {
            menuEntryId: subjectRef.attributes.id,
            displayName: subjectRef.attributes.name,
          };
        });
      });

      //////////////////////////////////////////////
      // +++++++++++++++++++++++++++++++++++++++++++
      //////////////////////////////////////////////

      this.pageEntry = {
        id: jsonDataFromXml.attributes.id,
        menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        subPageEntries: subPageEntries,
      };

      return this.pageEntry;

      //
      // TODO: check if needed
      // this.projekthandbuchService.setNavigationData(this.menuEntries);

      // this.onUpdate();
    });
  }

  public async getThemaContent(themaId: string): Promise<string | HTMLCollectionOf<Element>> {
    const urlThema =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Disziplin/' +
      this.disciplineId +
      '/Produkt/' +
      this.productId +
      '/Thema/' +
      themaId +
      '?' +
      this.getProjectFeaturesString();

    return axios.get(urlThema).then((response) => {
      const jsonThemaDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

      const description = jsonThemaDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
      return decodeXml(description);
    });
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.disciplineSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
    this.projectFeaturesSubscription.unsubscribe();
    this.navigationSubscription.unsubscribe();
  }

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public getPageEntryContent2(): PageEntry {
    return this.pageEntry;
  }

  public getPageEntryContent(menuEntryId: string): PageEntry {
    // console.log('asfsadfasdf');

    function findId(id, arr) {
      return arr.reduce((a, item) => {
        if (a) {
          return a;
        }
        if (item.id === id) {
          return item;
        }
        if (item.subMenuEntries) {
          return findId(id, item.subMenuEntries);
        }
      }, null);
    }

    // this.projectTypeSubscription = this.projekthandbuchService.getNavigationData().subscribe((menuEntries: []) => {
    // menuEntries = menuEntries;

    // });

    return findId(menuEntryId, this.menuEntries);

    // const { id } = useParams();
    // const pageEntry = PAGES_DATA.find((item) => item.menuEntryId === menuEntryId);
    // return pageEntry as PageEntry;
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature) => {
        return feature.id + '=' + feature.values.selectedValue;
      })
      .join('&');
  }
}
