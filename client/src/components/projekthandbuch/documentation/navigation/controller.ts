import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { ProductsNavigationController } from './products/controller';
import { TailoringNavigationController } from './tailoring/controller';
import { RolesNavigationController } from './roles/controller';
import { ProcessNavigationController } from './processes/controller';
import { findIdInMenuEntry } from '../../../../shares/utils';

export class NavigationController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public collapsed = false;

  public state = { navigation: [] };

  private productsNavigationController: ProductsNavigationController = new ProductsNavigationController();
  private processNavigationController: ProcessNavigationController = new ProcessNavigationController();
  private rolesNavigationController: RolesNavigationController = new RolesNavigationController();
  private tailoringNavigationController: TailoringNavigationController = new TailoringNavigationController();

  // TODO: type
  public menuEntries: { title: string; entries: MenuEntry[] }[] = [];

  public onInit(): void {
    this.productsNavigationController.onInit();
    this.processNavigationController.onInit();
    this.rolesNavigationController.onInit();
    this.tailoringNavigationController.onInit();
  }

  public onDestroy(): void {}
  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public onRouteChanged(menuEntryId: string): void {
    this.menuEntries.forEach((menu) => {
      const foundMenuEntry = findIdInMenuEntry(menuEntryId, menu.entries) as MenuEntry;
      if (foundMenuEntry) {
        switch (menu.title) {
          case 'products':
            this.projekthandbuchService.setDisciplineId(foundMenuEntry?.parentId);
            this.projekthandbuchService.setProductId(foundMenuEntry?.id);
            break;
          case 'process':
            this.projekthandbuchService.setDecisionPointId(foundMenuEntry?.id);
            break;
          case 'roles':
            this.projekthandbuchService.setRoleId(foundMenuEntry?.id);
            break;
          case 'tailoring':
            this.projekthandbuchService.setProcessBuildingBlockId(foundMenuEntry?.id);
            break;
        }
        return;
      }
    });

    this.projekthandbuchService.setNavigationData(this.menuEntries);
    this.onUpdate();
  }

  public setMenuEntries(): void {
    this.menuEntries = [
      { title: 'products', entries: this.productsNavigationController.getMenuEntries() },
      { title: 'roles', entries: this.rolesNavigationController.getMenuEntries() },
      { title: 'process', entries: this.processNavigationController.getMenuEntries() },
      { title: 'tailoring', entries: this.tailoringNavigationController.getMenuEntries() },
    ];
    // this.projekthandbuchService.setNavigationData(this.menuEntries);
  }

  public getMenuEntries(): MenuEntry[] {
    this.setMenuEntries();

    // flatten array
    let result: MenuEntry[] = [];
    this.menuEntries.forEach((value) => {
      result = [...result, ...value.entries];
    });

    return result;
  }

  public getData(): Promise<any> {
    const promise1 = this.productsNavigationController.getReferenceProducts();
    const promise2 = this.rolesNavigationController.getReferenceRolls();
    const promise3 = this.processNavigationController.getReferenceProcesses();
    const promise4 = this.tailoringNavigationController.getReferenceTailoring();

    return Promise.all([promise1, promise2, promise3, promise4]).then((values) => {
      return values;
    });
  }
}
