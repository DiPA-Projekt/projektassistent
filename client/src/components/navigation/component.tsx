import { Layout, Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import {
    ArrowLeftOutlined, ArrowRightOutlined, BookOutlined, DashboardOutlined
} from '@ant-design/icons';
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
        collapsible
        collapsed={this.ctrl.collapsed}
        // collapsedWidth={50}
        trigger={
          <button
            type="button"
            className="remove-button-style"
            title={`Seitemenü ${this.ctrl.collapsed ? 'auf' : 'zu'}klappen`}
          >
            {this.ctrl.collapsed ? <ArrowRightOutlined aria-label="" /> : <ArrowLeftOutlined aria-label="" />}
          </button>
        }
        onCollapse={() => {
          this.ctrl.toggleCollapse();
          this.forceUpdate();
        }}
        width={250}
      >
        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={['/projekthandbuch/projekt']}
          defaultOpenKeys={['/projekthandbuch']}
          triggerSubMenuAction="click"
          style={{ height: '100%' }}
        >
          <Menu.Item key="/">
            {this.ctrl.collapsed ? (
              <Link to="/" style={{ margin: 0, padding: 0 }}>
                <DashboardOutlined />
              </Link>
            ) : (
              <>
                <DashboardOutlined />
                <Link to="/">Dashboard</Link>
              </>
            )}
          </Menu.Item>
          <SubMenu
            key="/projekthandbuch"
            icon={
              <>
                {this.ctrl.collapsed ? (
                  <Link to="/" style={{ margin: 0, padding: 0 }}>
                    <BookOutlined />
                  </Link>
                ) : (
                  <>
                    <BookOutlined />
                  </>
                )}
              </>
            }
            title={<>{this.ctrl.collapsed ? null : <button className="remove-button-style">Projekthandbuch</button>}</>}
          >
            <Menu.Item key="/projekthandbuch/projekt">
              <Link to="/projekthandbuch/projekt">Projekt</Link>
            </Menu.Item>
            <Menu.Item key="/projekthandbuch/tailoring">
              <Link to="/projekthandbuch/tailoring">Tailoring</Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    );
  }
}
