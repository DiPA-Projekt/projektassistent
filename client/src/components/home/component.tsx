import { Layout } from 'antd';
import React, { Component } from 'react';

// import { GenericComponent } from '@leanup/lib';

import { HomeController } from './controller';

const { Content } = Layout;

export class HomeComponent extends Component<unknown, HomeController> {
  // public ctrl: HomeController = new HomeController();

  public render(): JSX.Element {
    return (
      <Content style={{ margin: '16px' }}>
        <h1>Home</h1>
      </Content>
    );
  }
}
