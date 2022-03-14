import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry, TableEntry, ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser, { XMLElement } from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { decodeXml, replaceUmlaute } from '../../../../../shares/utils';

export class RolesContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

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

    this.roleSubscription = this.projekthandbuchService.getRoleId().subscribe((roleId: string) => {
      if (roleId !== '') {
        this.roleId = roleId;
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
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(replaceUmlaute(response.data));

      const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);
      const tasksAndAuthorities = jsonDataFromXml.getElementsByTagName('Aufgaben_und_Befugnisse')[0]?.value;
      const skillProfile = jsonDataFromXml.getElementsByTagName('Faehigkeitsprofil')[0]?.value;
      const cast = jsonDataFromXml.getElementsByTagName('Rollenbesetzung')[0]?.value;

      const rolleVerantwortetProduktRefs: XMLElement[] =
        jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRefs');
      const rolleWirktMitBeiProduktRefs: XMLElement[] =
        jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRefs');

      const tableEntries: TableEntry[] = [];

      if (tasksAndAuthorities) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Aufgaben und Befugnisse',
          dataEntries: [{ title: decodeXml(tasksAndAuthorities) }],
        });
      }
      if (skillProfile) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Fähigkeitsprofil',
          dataEntries: [{ title: decodeXml(skillProfile) }],
        });
      }
      if (cast) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Rollenbesetzung',
          dataEntries: [{ title: decodeXml(cast) }],
        });
      }

      // //////////////////////////////////////////////
      //
      const rolesInCharge = rolleVerantwortetProduktRefs.flatMap((entry: XMLElement) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (rolesInCharge.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Verantwortlich für',
          dataEntries: rolesInCharge,
        });
      }

      // //////////////////////////////////////////////

      const rolesTakePart = rolleWirktMitBeiProduktRefs.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (rolesTakePart.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Wirkt mit bei',
          dataEntries: rolesTakePart,
        });
      }

      //////////////////////////////////////////////

      // console.log('this.pageEntry roles', this.pageEntry);

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: description,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
    // .catch((e) => {
    //   console.log(e);
    //   // 'obligatory catch'
    // });
    // this.onUpdate();
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
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
