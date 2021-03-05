import { Breadcrumb, Divider, Layout } from 'antd';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { DashboardController } from './controller';

const { Content } = Layout;

export class DashboardComponent extends ReactComponent<unknown, DashboardController> implements GenericComponent {
  public ctrl: DashboardController = new DashboardController();

  public render(): JSX.Element {
    return (
      <>
        <Breadcrumb style={{ margin: '16px 0 0 0' }}>
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <Divider />
        <Content>
          <h1>Dashboard</h1>
        </Content>
      </>
    );
  }
}
