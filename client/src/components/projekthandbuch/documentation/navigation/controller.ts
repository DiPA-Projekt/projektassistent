import { AbstractController } from '@leanup/lib/components/generic';

import MENU_DATA from './menu.data.json';

// Tiny helper interface
interface MenuEntry {
  id: number;
  displayName: string;
  subMenuEntries: MenuEntry[];
}

export class NavigationController extends AbstractController {
  public collapsed = false;

  public menuEntries: MenuEntry[] = [];

  public path: string[] = [];
  public paths: string[] = [];

  public onInit(): void {
    this.menuEntries = this.getMenuEntries();
  }

  public onDestroy(): void {}

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public getMenuEntries(): MenuEntry[] {
    const menuEntries = MENU_DATA || [];
    return menuEntries as MenuEntry[];
  }
}
