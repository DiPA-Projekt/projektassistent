import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry } from '../../../../../../openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { decodeXml, replaceUmlaute } from '../../../../../shares/utils';

export class RolesContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');
  public collapsed = false;

  public pageEntry: PageEntry | undefined;

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private roleSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();
  private navigationSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private roleId = '';
  private projectFeatures = [];

  private menuEntries = [];

  public onInit(): void {
    const paramId = this.pageEntry?.id || 1;

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

    this.roleSubscription = this.projekthandbuchService.getRoleId().subscribe((roleId: string) => {
      if (roleId !== '') {
        this.roleId = roleId;
      }
    });

    this.projectFeaturesSubscription = this.projekthandbuchService
      .getProjectFeatureValues()
      .subscribe((projectFeatures: []) => {
        this.projectFeatures = projectFeatures;
      });
  }

  public getContent(): Promise<any> {
    const url =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Rolle/' +
      this.roleId +
      '?' +
      this.getProjectFeaturesString();

    let idCounter = 2000;

    return axios.get(url).then((response) => {
      const jsonDataFromXml = new XMLParser().parseFromString(
        replaceUmlaute(response.data),
        'application/xml'
      ) as Document;

      const description: any = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);
      const tasksAndAuthorities: any = jsonDataFromXml.getElementsByTagName('Aufgaben_und_Befugnisse')[0]?.value;
      const skillProfile: any = jsonDataFromXml.getElementsByTagName('Faehigkeitsprofil')[0]?.value;
      const cast: any = jsonDataFromXml.getElementsByTagName('Rollenbesetzung')[0]?.value;

      const rolleVerantwortetProduktRefs: any = jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRefs');
      const rolleWirktMitBeiProduktRefs: any = jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRefs');

      const tableEntries = [];

      if (tasksAndAuthorities) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Aufgaben und Befugnisse',
          dataEntries: [{ title: decodeXml(tasksAndAuthorities) }],
        });
      }
      if (skillProfile) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Fähigkeitsprofil',
          dataEntries: [{ title: decodeXml(skillProfile) }],
        });
      }
      if (cast) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Rollenbesetzung',
          dataEntries: [{ title: decodeXml(cast) }],
        });
      }

      // //////////////////////////////////////////////
      //
      const rolesInCharge = rolleVerantwortetProduktRefs.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            menuEntryId: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (rolesInCharge.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Verantwortlich für',
          dataEntries: rolesInCharge,
        });
      }

      // //////////////////////////////////////////////

      const rolesTakePart = rolleWirktMitBeiProduktRefs.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            menuEntryId: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (rolesTakePart.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Wirkt mit bei',
          dataEntries: rolesTakePart,
        });
      }

      //////////////////////////////////////////////

      // console.log('this.pageEntry roles', this.pageEntry);

      this.pageEntry = {
        id: jsonDataFromXml.attributes.id,
        menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: description,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };

      return this.pageEntry;
    });
    // .catch((e) => {
    //   console.log(e);
    //   // 'obligatory catch'
    // });
    // this.onUpdate();

    // this.getForkJoin();
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
    this.projectFeaturesSubscription.unsubscribe();
    this.navigationSubscription.unsubscribe();
  }

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public getPageEntryContent2(): PageEntry {
    // console.log('getPageEntryContent2', this.pageEntry);
    return this.pageEntry;
  }

  public getPageEntryContent(menuEntryId: string): PageEntry {
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

  public setId(id: string): void {
    // console.log('id', id);
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature) => {
        return feature.id + '=' + feature.values.selectedValue;
      })
      .join('&');
  }
}
