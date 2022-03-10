import { AbstractController } from '@leanup/lib/components/generic';

import { MenuEntry, PageEntry } from '../../../../../openapi';
import { Subscription } from 'rxjs';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { ProductContentController } from './products/controller';
import { ProcessContentController } from './processes/controller';
import { RolesContentController } from './roles/controller';
import { TailoringContentController } from './tailoring/controller';

// Tiny helper interface
// interface PageEntry {
//   id: number;
//   menuEntryId: number;
//   header: string;
//   descriptionText: string;
//   tableEntries: TableEntry[];
// }

export class ContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');
  public collapsed = false;

  public state = { content: [] };

  public pageEntry: PageEntry | undefined;

  private productsContentController = new ProductContentController();
  private processContentController = new ProcessContentController();
  private rolesContentController = new RolesContentController();
  private tailoringContentController = new TailoringContentController();

  // private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  // private projectTypeVariantSubscription: Subscription = new Subscription();
  // private disciplineSubscription: Subscription = new Subscription();
  // private productSubscription: Subscription = new Subscription();
  // private projectFeaturesSubscription: Subscription = new Subscription();
  // private navigationSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private disciplineId = '';
  private productId = '';
  private projectFeatures = [];

  private selectedMenuEntry = {};

  public onInit(): void {
    this.productsContentController.onInit();
    this.processContentController.onInit();
    this.rolesContentController.onInit();
    this.tailoringContentController.onInit();
  }

  public async getThemaContent(themaId: string): Promise<string | HTMLCollectionOf<Element>> {
    // TODO: sollte wohl nicht fix sein
    return this.productsContentController.getThemaContent(themaId);

    // const urlThema =
    //   'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
    //   this.modelVariantsId +
    //   '/Projekttyp/' +
    //   this.projectTypeId +
    //   '/Projekttypvariante/' +
    //   this.projectTypeVariantId +
    //   '/Disziplin/' +
    //   this.disciplineId +
    //   '/Produkt/' +
    //   this.productId +
    //   '/Thema/' +
    //   themaId +
    //   '?' +
    //   this.getProjectFeaturesString();
    //
    //
    // return axios.get(urlThema).then((response) => {
    //   const jsonThemaDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;
    //
    //   const description = jsonThemaDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
    //   return he.decode(he.decode(description));
    // });
  }

  public onDestroy(): void {
    // this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription?.unsubscribe();
    // this.projectTypeVariantSubscription.unsubscribe();
    // this.disciplineSubscription.unsubscribe();
    // this.productSubscription.unsubscribe();
    // this.projectFeaturesSubscription.unsubscribe();
    // this.navigationSubscription.unsubscribe();
  }

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  // TODO: weitermachen
  public getPageEntryContent2(): PageEntry {
    console.log('getPageEntryContent2', this.selectedMenuEntry);
    return this.selectedMenuEntry;
  }

  public onRouteChanged(menuEntryId: string): void {
    // return await this.productsContentController.getContent().then((response) => {
    //   this.selectedMenuEntry = response;
    //
    //   console.log('123 onRouteChanged', this.selectedMenuEntry);
    //   return response;
    // });

    // return this.selectedMenuEntry;
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

    this.projectTypeSubscription = this.projekthandbuchService.getNavigationData().subscribe((menuEntries: []) => {
      // console.log('1111setValues1111');

      menuEntries.forEach((menu) => {
        const foundMenuEntry = findId(menuEntryId, menu.entries) as MenuEntry;
        if (foundMenuEntry) {
          switch (menu.title) {
            case 'products':
              return this.productsContentController.getContent().then((response) => {
                this.selectedMenuEntry = response;

                // console.log('123 onRouteChanged', this.selectedMenuEntry);
                this.onUpdate();
              });
            // this.projekthandbuchService.setDisciplineId(foundMenuEntry?.parentId);
            // this.projekthandbuchService.setProductId(foundMenuEntry?.id);
            // break;
            case 'process':
              return this.processContentController.getContent().then((response) => {
                this.selectedMenuEntry = response;

                // console.log('123 onRouteChanged', this.selectedMenuEntry);
                this.onUpdate();
              });
            // this.projekthandbuchService.setDecisionPointId(foundMenuEntry?.id);
            // break;
            case 'roles':
              return this.rolesContentController.getContent().then((response) => {
                this.selectedMenuEntry = response;

                // console.log('123 onRouteChanged', this.selectedMenuEntry);
                this.onUpdate();
              });
            // this.projekthandbuchService.setRoleId(foundMenuEntry?.id);
            // break;
            case 'tailoring':
              return this.tailoringContentController.getContent().then((response) => {
                this.selectedMenuEntry = response;

                // console.log('123 onRouteChanged', this.selectedMenuEntry);
                this.onUpdate();
              });
            // this.projekthandbuchService.setProcessBuildingBlockId(foundMenuEntry?.id);
            // break;
          }
          return;
        }
      });

      // const menuEntries2 = menuEntries;
      // console.log('234 - menuEntries', menuEntries2);
    });

    this.projectTypeSubscription.unsubscribe();

    // return findId(menuEntryId, this.menuEntries);
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
