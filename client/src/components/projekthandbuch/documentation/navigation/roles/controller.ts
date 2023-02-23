import { AbstractController } from '@leanup/lib';

import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';

import { Subscription } from 'rxjs';
import { DI } from '@leanup/lib';
import { MenuEntry, ProjectFeature } from '@dipa-projekt/projektassistent-openapi';

export class RolesNavigationController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public state = { navigation: [] };

  public menuEntries: MenuEntry[] = [];

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private projectFeatures: ProjectFeature[] = [];

  private idCounter = 3000;

  public onInit(): void {
    // console.log('onInit RolesNavigationController');

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

    this.projectFeaturesSubscription = this.projekthandbuchService
      .getProjectFeatureValues()
      .subscribe((projectFeatures: ProjectFeature[]) => {
        this.projectFeatures = projectFeatures;
      });

    // this.getReferenceRolls()
    //   .then((result) => {
    //     this.menuEntries = this.menuEntries.concat(result);
    //
    //     // this.projekthandbuchService.setNavigationData(this.menuEntries);
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });

    // this.onUpdate();

    // console.log('Ende onInit RolesNavigationController');
  }

  public getReferenceRolls(): Promise<MenuEntry[]> {
    const urlReferenceRolls =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Rollenkategorie?' +
      this.getProjectFeaturesString();

    // console.log(urlReferenceRolls);

    return axios.get(urlReferenceRolls).then((response) => {
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const rolesNavigation: MenuEntry[] = jsonDataFromXml
        .getElementsByTagName('Rollenkategorie')
        .map((roleCategoryValue) => {
          const roles: MenuEntry[] = roleCategoryValue.getElementsByTagName('RolleRef').map((roleValue): MenuEntry => {
            return {
              id: roleValue.attributes.id,
              parentId: roleCategoryValue.attributes.id,
              displayName: roleValue.attributes.name,
              subMenuEntries: [],
            };
          });

          //   id: `roleCategory_${this.idCounter++}`,
          //   parentId: '3',
          //   displayName: roleCategoryValue.attributes.name,
          //   subMenuEntries: roles,
          // });

          return {
            id: `roleCategory_${this.idCounter++}`,
            parentId: '3',
            displayName: roleCategoryValue.attributes.name,
            subMenuEntries: roles,
          };
        });

      // console.log('roles navigation ready', rolesNavigation);

      this.menuEntries = [
        {
          id: '3',
          parentId: '',
          displayName: 'Referenz Rollen',
          displayIcon: 'team',
          subMenuEntries: rolesNavigation,
        },
      ];

      return this.menuEntries;
    });
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.projectFeaturesSubscription.unsubscribe();
  }

  public getMenuEntries(): MenuEntry[] {
    return this.menuEntries;
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature: ProjectFeature) => {
        return `${feature.id}=${feature.values?.selectedValue}`;
      })
      .join('&');
  }
}
