import React, { Component, Key } from 'react';
import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import { DownOutlined } from '@ant-design/icons';
import { ReactComponent } from '@leanup/lib/components/react';
import { SelectTreeController } from './controller';

export class SelectTree
  extends ReactComponent<{ data: DataNode[]; checkedKeys: Key[]; disabled: boolean }, any>
  implements Component {
  public ctrl: SelectTreeController;

  public constructor(props: { data: DataNode[]; checkedKeys: Key[]; disabled: boolean }) {
    super(props);
    // this.state = { expandedKeys: [], checkedKeys: props.checkedKeys };
    this.ctrl = new SelectTreeController(this.forceUpdate.bind(this));
    // console.log('SelectTree', props.checkedKeys);
    this.ctrl.disabled = props.disabled;
    this.ctrl.expandedKeys = props.checkedKeys; // TODO: check
    this.ctrl.checkedKeys = props.checkedKeys; // TODO: check
  }

  public render(): JSX.Element {
    const onExpand = (expandedKeysValue: React.Key[]) => {
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.ctrl.autoExpandParent = false;
      this.ctrl.expandedKeys = expandedKeysValue;
      this.setState({ expandedKeysValue: expandedKeysValue });
    };

    const onCheck = (checkedKeysValue: React.Key[] | { checked: Key[]; halfChecked: Key[] }) => {
      this.ctrl.checkedKeys = checkedKeysValue;
      this.setState({ checkedKeys: checkedKeysValue });
    };

    const onSelect = (selectedKeysValue: React.Key[] /*, info: any*/) => {
      this.ctrl.selectedKeys = selectedKeysValue;
      this.setState({ selectedKeys: selectedKeysValue });
    };

    return (
      <Tree
        disabled={this.ctrl.disabled}
        checkable
        showIcon={true}
        onExpand={onExpand}
        expandedKeys={this.ctrl.expandedKeys}
        autoExpandParent={this.ctrl.autoExpandParent}
        onCheck={onCheck}
        onSelect={onSelect}
        checkedKeys={this.ctrl.checkedKeys}
        selectedKeys={this.ctrl.selectedKeys}
        switcherIcon={<DownOutlined />}
        treeData={this.props.data}
        defaultCheckedKeys={this.ctrl.checkedKeys as React.Key[]}
      />
    );
  }
}
