import { Col, Layout, Menu, MenuProps, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOutlined, FileTextOutlined, HomeOutlined, ScissorOutlined } from '@ant-design/icons';

import LOGO from '../../assets/logo.vmodell.xt.bund.jpg';

const { Header } = Layout;

const items: MenuProps['items'] = [
  {
    label: 'Home',
    key: 'home',
    icon: <HomeOutlined />,
  },
  {
    label: 'Tailoring',
    key: 'tailoring',
    icon: <ScissorOutlined />,
  },
  {
    label: 'Dokumentation',
    key: 'dokumentation',
    icon: <FileTextOutlined />,
  },
  {
    label: 'Produktvorlagen',
    key: 'productTemplates',
    icon: <BookOutlined />,
  },
];

// <Menu.Item key="1">
//   <HomeOutlined />
//   <Link to="/"> Home</Link>
// </Menu.Item>
// <Menu.Item key="2">
//   <ScissorOutlined />
//   <NavLink to="/tailoring">Tailoring</NavLink>
// </Menu.Item>
// <Menu.Item key="3">
//   <FileTextOutlined />
//   <NavLink to="/documentation">Dokumentation</NavLink>
// </Menu.Item>
// <Menu.Item key="4">
//   <BookOutlined />
//   <NavLink to="/produktvorlagen">Produktvorlagen</NavLink>
// </Menu.Item>

export const SiteHeader = (props: any) => {
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
          <Menu mode="horizontal" theme="dark" defaultSelectedKeys={[props.selectedKey]} items={items}></Menu>
        </Col>
      </Row>
    </Header>
  );
};
