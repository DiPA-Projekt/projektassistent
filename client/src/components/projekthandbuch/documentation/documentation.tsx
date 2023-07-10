import React from 'react';
import { Layout } from 'antd';
import { Navigation } from './navigation/navigation';
import { Content } from './content/content';
import { DocumentationSessionContextProvider } from '../../../context/DocumentationContext';
import { Breadcrumbs } from '../../Breadcrumbs';
import { SiderToggle } from '../../SiderToggle';

export function Documentation() {
  //
  // const {
  //   modelVariantId,
  //   projectTypeVariantId,
  //   projectTypeId,
  //   projectFeatures,
  // } = useTailoring();
  //
  //

  return (
    <Layout>
      <DocumentationSessionContextProvider>
        <Navigation />
        <Layout>
          <Layout className="sider-toggle-breadcrumbs">
            <SiderToggle />
            <Breadcrumbs />
          </Layout>
          <Content />
        </Layout>
      </DocumentationSessionContextProvider>
    </Layout>
  );
}
