import { Layout } from 'antd';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { HomeController } from './controller';

const { Content } = Layout;

export class HomeComponent extends ReactComponent<unknown, HomeController> implements GenericComponent {
  public ctrl: HomeController = new HomeController();

  public render(): JSX.Element {
    return (
      <>
        <Content style={{ margin: '16px' }}>
          <h1>Home</h1>
        </Content>
      </>
    );
  }
}
