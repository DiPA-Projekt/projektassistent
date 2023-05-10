import { Col, Layout, Menu, MenuProps, Row } from 'antd';
import React from 'react';
import { BookOutlined, FileTextOutlined, HomeOutlined, ScissorOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTailoring } from '../../context/TailoringContext';
import useImage from '../../hooks/useImage';

const { Header } = Layout;

const items: MenuProps['items'] = [
  {
    label: <a href="#/">Home</a>,
    key: 'home',
    icon: <HomeOutlined />,
  },
  {
    label: <a href="#/tailoring">Tailoring</a>,
    key: 'tailoring',
    icon: <ScissorOutlined />,
  },
  {
    label: <a href="#/documentation">Dokumentation</a>,
    key: 'dokumentation',
    icon: <FileTextOutlined />,
  },
  {
    label: <a href="#/productTemplates">Produktvorlagen</a>,
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
  const { modelVariantId } = useTailoring();

  // const navigate = useNavigate();

  // const handleMenuClick = ({ key: string }) => {
  // if (key) {
  //   navigate(key);
  // }
  // };

  const { error, image } = useImage(modelVariantId + '/ALLG-Logo-Farbe.gif');

  // TODO
  // if (error) {
  //   console.log('error on fetching image', error);
  // }

  // const logoPath = '../../assets/' + modelVariantId + '/ALLG-Logo-Farbe.gif';

  return (
    <Header>
      <Row>
        <Col span={4}>
          {image && (
            <Link
              id="logo"
              to="/"
              title="Zurück zur Hauptseite"
              style={{
                backgroundImage: `url(${image})`,
                margin: '4px',
                height: '56px',
                width: '56px',
                overflow: 'hidden',
                display: 'block',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}
        </Col>
        <Col span={18}>
          <Menu
            mode="horizontal"
            theme="dark"
            defaultSelectedKeys={[props.selectedKey]}
            // onClick={handleMenuClick}
            items={items}
          ></Menu>

          {/*<Breadcrumbs />*/}
        </Col>
      </Row>
    </Header>
  );
};
