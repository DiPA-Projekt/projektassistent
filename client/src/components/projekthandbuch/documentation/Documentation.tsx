import React from 'react';
import { Layout } from 'antd';
import { Navigation, NavTypeEnum } from './navigation/Navigation';
import { Content } from './content/Content';
import { DocumentationSessionContextProvider } from '../../../context/DocumentationContext';
import { Breadcrumbs } from '../../Breadcrumbs';
import { SiderToggle } from '../../SiderToggle';
import { ColumnsType } from 'antd/es/table';

export type DataEntry = {
  id: string;
  title: string;
  suffix?: string;
};

export type DataSource = {
  modelElement: string;
  dataTypes: NavTypeEnum[];
};

export type PageEntry = {
  id: string;
  header: string;
  descriptionText: string;
  tableEntries: TableEntry[];
  dataSource?: DataSource;
  columns?: ColumnsType<any>;
  subPageEntries?: PageEntry[];
};

export type TableEntry = {
  id: string;
  descriptionEntry: string;
  dataEntryDescription?: string;
  dataEntries: DataEntry[];
};

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
