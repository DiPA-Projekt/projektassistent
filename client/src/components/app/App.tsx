import React from 'react';
import { Route, Routes } from 'react-router';
import { Home } from '../../pages/Home';
import { Layout } from 'antd';
import { SiteHeader } from '../header/SiteHeader';
import { ProjekthandbuchComponent } from '../projekthandbuch/component';
import { ProduktvorlagenComponent } from '../projekthandbuch/produktvorlagen/component';
import { Project } from '../projekthandbuch/projekt/project';
import { Documentation } from '../projekthandbuch/documentation/documentation';

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SiteHeader />
      <Layout>
        <Layout style={{ backgroundColor: 'white' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tailoring" element={<Project />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/projekthandbuch" element={<ProjekthandbuchComponent />} />
            <Route path="/produktvorlagen" element={<ProduktvorlagenComponent />} />
            {/*<Route path="*" element={<HomeComponent />} />*/}
          </Routes>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
