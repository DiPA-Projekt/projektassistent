import { Layout, Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { DashboardOutlined, ScissorOutlined } from '@ant-design/icons';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { NavigationController } from './controller';

const { SubMenu } = Menu;
const { Sider } = Layout;

export class NavigationComponent extends ReactComponent<unknown, NavigationController> implements GenericComponent {
  public ctrl: NavigationController = new NavigationController();

  public render(): JSX.Element {
    return (
      <Sider
        // collapsible
        // collapsed={this.ctrl.collapsed}
        // collapsedWidth={50}
        // onCollapse={() => {
        //   this.ctrl.toggleCollapse();
        //   this.forceUpdate();
        // }}
        width={250}
      >
        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={['/projekthandbuch/projekt']}
          defaultOpenKeys={['/projekthandbuch']}
          style={{ height: '100%' }}
        >
          <Menu.Item key="/">
            <DashboardOutlined />
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <SubMenu
            key="/projekthandbuch"
            icon={<ScissorOutlined />}
            title={<button className="remove-button-style">Projekthandbuch</button>}
          >
            <Menu.Item key="/projekthandbuch/projekt">
              <Link to="/projekthandbuch/projekt">Projekt</Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    );
  }
}
