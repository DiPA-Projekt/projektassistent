import { Subscription } from 'rxjs';

import { StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib';
import { DI } from '@leanup/lib';

import TREE from './tree.data.json';

export interface TreeItem {
  label: string;
  subtree: TreeItem[];
}

export class BeispielController extends AbstractController {
  private readonly statusApi: StatusApi = DI.get<StatusApi>('StatusApi');
  private sub: Subscription = new Subscription();

  public tree: TreeItem[] = TREE;

  public onInit(): void {
    this.sub = this.statusApi.getStatus().subscribe((...args) => {
      console.log(args);
    });
  }

  public onDestroy(): void {
    this.sub.unsubscribe();
  }
}
