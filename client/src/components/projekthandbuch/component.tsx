import { Breadcrumb, Divider, Layout } from 'antd';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProjekthandbuchController } from './controller';
import { ProjektComponent } from './projekt/component';
import { TailoringComponent } from './tailoring/component';
import { ProduktvorlagenComponent } from './produktvorlagen/component';

const { Content } = Layout;

export class ProjekthandbuchComponent
  extends ReactComponent<unknown, ProjekthandbuchController>
  implements GenericComponent {
  public readonly ctrl: ProjekthandbuchController = new ProjekthandbuchController();

  public render(): JSX.Element {
    return (
      <>
        <Breadcrumb style={{ margin: '16px 0 0 0' }}>
          <Breadcrumb.Item>Projekthandbuch</Breadcrumb.Item>
          <Breadcrumb.Item>Projekt</Breadcrumb.Item>
          <Breadcrumb.Item>Tailoring</Breadcrumb.Item>
        </Breadcrumb>
        <Divider />
        <Content>
          <Switch>
            <Redirect exact path="/projekthandbuch" to="/projekthandbuch/projekt" />
            <Route exact path="/projekthandbuch/projekt">
              <ProjektComponent />
            </Route>
            <Route exact path="/projekthandbuch/tailoring">
              <TailoringComponent />
            </Route>
            <Route exact path="/produktvorlagen">
              <ProduktvorlagenComponent />
            </Route>
          </Switch>
        </Content>
      </>
    );
  }
}
