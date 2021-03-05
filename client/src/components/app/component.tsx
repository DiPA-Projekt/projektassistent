import { Layout } from 'antd';
import React from 'react';
import { Route, Switch } from 'react-router';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { DashboardComponent } from '../dashboard/component';
import { FooterComponent } from '../footer/component';
import { HeaderComponent } from '../header/component';
import { NavigationComponent } from '../navigation/component';
import { ProjekthandbuchComponent } from '../projekthandbuch/component';
import { AppController } from './controller';

export class AppComponent extends ReactComponent<unknown, AppController> implements GenericComponent {
  public ctrl: AppController = new AppController();

  public render(): JSX.Element {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderComponent />
        <Layout>
          <NavigationComponent />
          <Layout style={{ padding: '0 24px 0 24px', backgroundColor: 'white' }}>
            <Switch>
              <Route exact path="/">
                <DashboardComponent />
              </Route>
              <Route path="/projekthandbuch">
                <ProjekthandbuchComponent />
              </Route>
            </Switch>
            <FooterComponent />
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
