import { Layout } from 'antd';
import React from 'react';
import { Route, Switch } from 'react-router';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { HomeComponent } from '../home/component';
import { HeaderComponent } from '../header/component';
import { ProjekthandbuchComponent } from '../projekthandbuch/component';
import { AppController } from './controller';

export class AppComponent extends ReactComponent<unknown, AppController> implements GenericComponent {
  public ctrl: AppController = new AppController();

  public render(): JSX.Element {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderComponent />
        <Layout>
          <Layout style={{ backgroundColor: 'white' }}>
            <Switch>
              <Route exact path="/">
                <HomeComponent />
              </Route>
              <Route path="/projekthandbuch">
                <ProjekthandbuchComponent />
              </Route>
            </Switch>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
