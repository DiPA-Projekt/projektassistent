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

export class ProductsNavigationController extends AbstractController {
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

  // private idCounter = 3000;

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

    this.projectFeaturesSubscription = this.projekthandbuchService
      .getProjectFeatureValues()
      .subscribe((projectFeatures: []) => {
        this.projectFeatures = projectFeatures;
      });

    // this.getReferenceProducts()
    //   .then((result) => {
    //     this.menuEntries = this.menuEntries.concat(result);
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });

    // this.onUpdate();
  }

  public getReferenceProducts(): Promise<MenuEntry[]> {
    const urlReferenceProducts =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Disziplin?' +
      this.getProjectFeaturesString();

    // console.log(urlReferenceProducts);
    // TODO: use "checkParameter" function

    if (!this.modelVariantsId || !this.projectTypeId || !this.projectTypeVariantId) {
      return Promise.resolve([]);
    }

    return axios.get(urlReferenceProducts).then((response) => {
      const jsonDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

      const navigation: MenuEntry[] = jsonDataFromXml.getElementsByTagName('Disziplin').map((disciplineValue) => {
        const products: [] = disciplineValue.getElementsByTagName('Produkt').map((productValue): MenuEntry => {
          return {
            id: productValue.attributes.id,
            parentId: disciplineValue.attributes.id,
            displayName: productValue.attributes.name,
            subMenuEntries: [],
          };
        });

        return {
          id: disciplineValue.attributes.id,
          parentId: '2',
          displayName: disciplineValue.attributes.name,
          subMenuEntries: products,
        };
      });

      this.menuEntries = [
        {
          id: '1',
          parentId: '',
          displayName: 'Referenz Produkte',
          displayIcon: 'shopping',
          subMenuEntries: [
            {
              id: '2',
              parentId: '1',
              displayName: 'Produkte',
              subMenuEntries: navigation,
            },
          ],
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
    if (pageEntry) {
      this.projekthandbuchService.setDisciplineId(pageEntry?.parentId);
      this.projekthandbuchService.setProductId(pageEntry?.id);
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
