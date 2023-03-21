import React from 'react';
import { Layout } from 'antd';
import { Navigation } from './navigation/navigation';
import { Content } from './content/content';
import { DocumentationSessionContextProvider } from '../../../context/DocumentationContext';
import { Breadcrumbs } from '../../Breadcrumbs';

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
        <Breadcrumbs />
        <Layout>
          <Navigation />
          <Content />
        </Layout>
      </DocumentationSessionContextProvider>
    </Layout>
  );
}
