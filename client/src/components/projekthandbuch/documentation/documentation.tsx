import React from 'react';
import { Layout } from 'antd';
import { Navigation } from './navigation/navigation';
import { Content } from './content/content';
import { DocumentationSessionContextProvider } from '../../../context/DocumentationContext';

export function Documentation() {
  return (
    <Layout>
      <DocumentationSessionContextProvider>
        <Navigation />
        <Content />
      </DocumentationSessionContextProvider>
    </Layout>
  );
}
