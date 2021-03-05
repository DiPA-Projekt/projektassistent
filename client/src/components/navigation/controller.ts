import { AbstractController } from '@leanup/lib/components/generic';

export class NavigationController extends AbstractController {
  public collapsed = false;

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }
}
