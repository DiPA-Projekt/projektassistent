import { AbstractController } from '@leanup/lib/components/generic';

import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';

import { Subscription } from 'rxjs';
import { DI } from '@leanup/lib/helpers/injector';
import { PageEntry } from '../../../../../../openapi';

// Tiny helper interface
interface MenuEntry {
  id: string;
  parentId: string;
  displayName: string;
  displayIcon?: string;
  subMenuEntries: MenuEntry[];
}

export class RolesNavigationController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public collapsed = false;

  public state = { navigation: [] };

  public menuEntries: MenuEntry[] = [];

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private projectFeatures = [];

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
      .subscribe((projectFeatures: []) => {
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
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Rollenkategorie?' +
      this.getProjectFeaturesString();

    // console.log(urlReferenceRolls);

    return axios.get(urlReferenceRolls).then((response) => {
      const jsonDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

      const rolesNavigation: MenuEntry[] = jsonDataFromXml
        .getElementsByTagName('Rollenkategorie')
        .map((roleCategoryValue) => {
          const roles: [] = roleCategoryValue.getElementsByTagName('RolleRef').map((roleValue): MenuEntry => {
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

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public onRouteChanged(menuEntryId: string): PageEntry {
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

    const pageEntry = findId(menuEntryId, this.menuEntries);
    console.log(pageEntry);
    if (pageEntry) {
      // this.projekthandbuchService.setDisciplineId(pageEntry?.parentId);
      this.projekthandbuchService.setRoleId(pageEntry?.id);
    }
  }

  public getMenuEntries(): MenuEntry[] {
    return this.menuEntries as MenuEntry[];
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature) => {
        return feature.id + '=' + feature.values.selectedValue;
      })
      .join('&');
  }
}
