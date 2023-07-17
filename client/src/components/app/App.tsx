import React from 'react';
import { Route } from 'react-router-dom';
import { Home } from '../Home';
import './../../i18n';
import { Project } from '../projekthandbuch/projekt/project';
import { Documentation } from '../projekthandbuch/documentation/Documentation';
import { Templates } from '../projekthandbuch/produktvorlagen/Templates';
import { Layout } from 'antd';
import { SiteHeader } from '../header/SiteHeader';
import { Routes } from 'react-router';
import { SiteFooter } from '../footer/SiteFooter';
import { Content } from 'antd/es/layout/layout';

export const weitApiUrl = 'https://vm-api.weit-verein.de';

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SiteHeader />
      <Layout>
        <Content style={{ padding: '0 25px' }}>
          <Routes>
            <Route path="/" element={<Project />} />
            <Route path="/tailoring" element={<Project />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/documentation/:id" element={<Documentation />} />
            <Route path="/productTemplates" element={<Templates />} />
            <Route path="/info" element={<Home />} />
            {/*<Route path="*" element={<HomeComponent />} />*/}
          </Routes>
        </Content>
      </Layout>
      <SiteFooter />
    </Layout>
  );
}

export default App;
