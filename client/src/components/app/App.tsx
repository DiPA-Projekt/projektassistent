import React from 'react';
import { Route } from 'react-router-dom';
import { Home } from '../../pages/Home';
import './../../i18n';
import { Project } from '../projekthandbuch/projekt/project';
import { Documentation } from '../projekthandbuch/documentation/documentation';
import { ProjekthandbuchComponent } from '../projekthandbuch/component';
import { ProduktvorlagenComponent } from '../projekthandbuch/produktvorlagen/component';
import { Layout } from 'antd';
import { SiteHeader } from '../header/SiteHeader';
import { Routes } from 'react-router';
import { SiteFooter } from '../footer/SiteFooter';
import { Content } from 'antd/es/layout/layout';

// const menuItems = [
//   {
//     key: '1',
//     label: (
//       <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
//         General
//       </a>
//     ),
//   },
//   {
//     key: '2',
//     label: (
//       <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
//         Layout
//       </a>
//     ),
//   },
//   {
//     key: '3',
//     label: (
//       <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
//         Navigation
//       </a>
//     ),
//   },
// ];

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SiteHeader />
      <Layout>
        <Content style={{ padding: '0 25px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tailoring" element={<Project />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/documentation/:id" element={<Documentation />} />
            <Route path="/projekthandbuch" element={<ProjekthandbuchComponent />} />
            <Route path="/produktvorlagen" element={<ProduktvorlagenComponent />} />
            {/*<Route path="*" element={<HomeComponent />} />*/}
          </Routes>
        </Content>
      </Layout>
      <SiteFooter />
    </Layout>
  );
}

export default App;
