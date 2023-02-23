import { AbstractController } from '@leanup/lib';

import { PageEntry, MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib';
import { ProductContentController } from './products/controller';
import { ProcessContentController } from './processes/controller';
import { RolesContentController } from './roles/controller';
import { TailoringContentController } from './tailoring/controller';
import { findIdInMenuEntry } from '../../../../shares/utils';

interface NavigationMenuEntry {
  title: string;
  entries: MenuEntry[];
}

export class ContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public state = { content: [] };

  public pageEntry: PageEntry | undefined;

  private productsContentController = new ProductContentController();
  private processContentController = new ProcessContentController();
  private rolesContentController = new RolesContentController();
  private tailoringContentController = new TailoringContentController();

  private projectTypeSubscription: Subscription = new Subscription();

  private selectedPageEntry: PageEntry = {
    subPageEntries: [],
    descriptionText: '',
    header: '',
    id: '',
    // menuEntryId: '',
    tableEntries: [],
  };

  public onInit(): void {
    this.productsContentController.onInit();
    this.processContentController.onInit();
    this.rolesContentController.onInit();
    this.tailoringContentController.onInit();
  }

  public async getThemaContent(themaId: string): Promise<string> {
    // TODO: nicht fix für productsContentController aufrufen
    return this.productsContentController.getThemaContent(themaId);
  }

  public onDestroy(): void {
    this.projectTypeSubscription?.unsubscribe();
  }

  public getSelectedPageEntry(): PageEntry {
    return this.selectedPageEntry;
  }

  public onRouteChanged(menuEntryId: string): void {
    // console.log('onRouteChanged content');
    this.projectTypeSubscription = this.projekthandbuchService
      .getNavigationData()
      .subscribe((menuEntries: NavigationMenuEntry[]) => {
        menuEntries.forEach((menu) => {
          const foundMenuEntry = findIdInMenuEntry(menuEntryId, menu.entries);
          if (foundMenuEntry) {
            switch (menu.title) {
              case 'products':
                void this.productsContentController.getContent().then((response: PageEntry) => {
                  this.selectedPageEntry = response;
                  this.onUpdate();
                });
                break;
              case 'process':
                void this.processContentController.getContent().then((response: PageEntry) => {
                  this.selectedPageEntry = response;
                  this.onUpdate();
                });
                break;
              case 'roles':
                void this.rolesContentController.getContent().then((response: PageEntry) => {
                  this.selectedPageEntry = response;
                  this.onUpdate();
                });
                break;
              case 'tailoring':
                void this.tailoringContentController.getContent().then((response: PageEntry) => {
                  this.selectedPageEntry = response;
                  this.onUpdate();
                });
                break;
            }
          }
        });
      });

    this.projectTypeSubscription.unsubscribe();
  }
}
