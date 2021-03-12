import { Col, Layout, Menu, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { BookOutlined, DashboardOutlined } from '@ant-design/icons';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import LOGO from '../../assets/logo.vmodell.xt.bund.jpg';
import { HeaderController } from './controller';

const { Header } = Layout;

export class HeaderComponent extends ReactComponent<unknown, unknown> implements GenericComponent {
  public readonly ctrl: HeaderController = new HeaderController();

  public render(): JSX.Element {
    return (
      <Header>
        <Row>
          <Col span={4}>
            <Link
              id="logo"
              to="/"
              title="Zurück zur Hauptseite"
              style={{
                backgroundImage: `url(${LOGO as string})`,
                margin: '4px',
                height: '56px',
                width: '56px',
                overflow: 'hidden',
                display: 'block',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </Col>
          <Col span={18}>
            <Menu mode="horizontal" triggerSubMenuAction="click" theme="dark">
              <Menu.Item key="1">
                <DashboardOutlined />
                <Link to="/"> Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <BookOutlined />
                <Link to="/projekthandbuch">Projekthandbuch</Link>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>
      </Header>
    );
  }
}
