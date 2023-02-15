import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry, TableEntry, ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { replaceUmlaute, decodeXml } from '../../../../../shares/utils';

export class ProductContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

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
  private projectFeatures: ProjectFeature[] = [];

  public onInit(): void {
    this.metaModelVariantSubscription = this.projekthandbuchService
      .getModelVariantId()
      .subscribe((modelVariantsId: string) => {
        this.modelVariantsId = modelVariantsId;
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
      .subscribe((projectFeatures: ProjectFeature[]) => {
        this.projectFeatures = projectFeatures;
      });
  }

  public async getContent(): Promise<PageEntry> {
    const url =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
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

    console.log(url);

    let idCounter = 2000;

    if (!this.disciplineId) {
      // TODO: nicht unbedingt reject
      return Promise.reject(Error('no discipline id set'));
    }

    return axios.get(url).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(replaceUmlaute(response.data));

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
      const rolleVerantwortetProduktRef = jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRef');
      const rolleWirktMitBeiProduktRef = jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRef');
      const produktZuEntscheidungspunktRef = jsonDataFromXml.getElementsByTagName('ProduktZuEntscheidungspunktRef');
      const themaZuProduktRef = jsonDataFromXml.getElementsByTagName('ThemaZuProduktRef');
      const aktivitaetRef = jsonDataFromXml.getElementsByTagName('AktivitaetZuProduktRef');
      const externeKopiervorlageZuProduktRef = jsonDataFromXml.getElementsByTagName('ExterneKopiervorlageZuProduktRef');

      const tableEntries: TableEntry[] = [];
      // const subPageEntries = [];

      //////////////////////////////////////////////

      const rolesInCharge = rolleVerantwortetProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('RolleRef').map((roleRef) => {
          return {
            id: roleRef.attributes.id,
            title: roleRef.attributes.name,
          };
        });
      });

      if (rolesInCharge.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Verantwortlich', //rolleVerantwortetProduktRef[0]?.attributes.name,
          dataEntries: rolesInCharge,
        });
      }

      //////////////////////////////////////////////

      const rolesTakePart = rolleWirktMitBeiProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('RolleRef').map((roleRef) => {
          return {
            id: roleRef.attributes.id,
            title: roleRef.attributes.name,
          };
        });
      });

      if (rolesTakePart.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Mitwirkend', //rolleWirktMitBeiProduktRef[0]?.attributes.name,
          dataEntries: rolesTakePart,
        });
      }

      //////////////////////////////////////////////

      const activities = aktivitaetRef.flatMap((entry) => {
        return entry.getElementsByTagName('AktivitaetRef').map((activityRef) => {
          return {
            id: activityRef.attributes.id,
            // menuEntryId: activityRef.attributes.id,
            title: activityRef.attributes.name,
            suffix: '(Aktivität)',
          };
        });
      });

      const products = externeKopiervorlageZuProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('ExterneKopiervorlageRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            // menuEntryId: productRef.attributes.id,
            title: productRef.attributes.name,
            suffix: '(Externe Kopiervorlage)',
          };
        });
      });

      const tools = [...activities, ...products];
      // console.log('Tools', tools);

      if (tools.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Hilfsmittel', //produktZuEntscheidungspunktRef[0]?.attributes.name,
          dataEntries: tools,
        });
      }

      //////////////////////////////////////////////

      const decisionPoints = produktZuEntscheidungspunktRef.flatMap((entry) => {
        return entry.getElementsByTagName('EntscheidungspunktRef').map((decisionPointRef) => {
          return {
            id: decisionPointRef.attributes.id,
            title: decisionPointRef.attributes.name,
          };
        });
      });

      if (decisionPoints.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
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
            id: subjectRef.attributes.id,
            header: subjectRef.attributes.name,
          };
        });
      });

      //////////////////////////////////////////////
      // +++++++++++++++++++++++++++++++++++++++++++
      //////////////////////////////////////////////

      return {
        id: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        subPageEntries: subPageEntries,
      };

      // this.onUpdate();
    });
  }

  public async getThemaContent(themaId: string): Promise<string> {
    const urlThema =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
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
      const jsonThemaDataFromXml = new XMLParser().parseFromString(response.data);

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

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature: ProjectFeature) => {
        return `${feature.id}=${feature.values?.selectedValue}`;
      })
      .join('&');
  }
}
