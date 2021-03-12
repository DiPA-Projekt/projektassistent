import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { BeispielController, TreeItem } from './controller';

function renderTreeItem(treeItems: TreeItem[]): JSX.Element {
  return (
    <ul>
      {treeItems.map((treeItem: TreeItem, index: number) => {
        return (
          <li key={`tree-item-${index}`}>
            {treeItem.label}
            {treeItem.subtree.length > 0 && renderTreeItem(treeItem.subtree)}
          </li>
        );
      })}
    </ul>
  );
}

export class BeispielComponent extends ReactComponent<unknown, BeispielController> implements GenericComponent {
  public ctrl: BeispielController = new BeispielController();

  public componentDidMount(): void {
    this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    return (
      <div>
        <h2>Tree-Example</h2>
        {renderTreeItem(this.ctrl.tree)}
      </div>
    );
  }
}
