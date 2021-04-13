import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ContentController } from './controller';

import { useParams } from 'react-router-dom';
import MENU_DATA from './../navigation/menu.data.json';
import { Avatar, BackTop, Col, Layout, List, Row } from 'antd';
import { MenuEntry, TableEntry } from '../../../../../openapi';

import 'antd/dist/antd.css';

import {
  FolderAddOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
  PartitionOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FooterComponent } from '../../../footer/component';
import { AnchorList } from '../anchorList/component';

// Tiny helper interface
interface MenuEntryDepth {
  menuEntry: MenuEntry;
  depth: number;
}

export let menuEntryFound: MenuEntryDepth;

function findMenuEntry(menuEntry: MenuEntry, menuEntryId: number, depth: number): MenuEntryDepth | undefined {
  if (menuEntry.id === menuEntryId) {
    return { menuEntry, depth };
  }

  if (menuEntry.subMenuEntries) {
    for (const subMenuEntry of menuEntry.subMenuEntries) {
      const menuEntryWithDepth = findMenuEntry(subMenuEntry, menuEntryId, depth + 1);
      if (menuEntryWithDepth !== undefined) {
        return menuEntryWithDepth;
      }
    }
  }
  return undefined;
}

function renderSwitch(param: string) {
  switch (param) {
    // Referenz Produkte
    case 'Verantwortlich':
      return <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />;
    case 'Mitwirkend':
      return <Avatar style={{ backgroundColor: '#ff7f36' }} icon={<TeamOutlined />} />;
    case 'Hilfsmittel':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<MedicineBoxOutlined />} />;
    case 'Teil von':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Besteht aus':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Produktumfang':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Erzeugt':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<FolderAddOutlined />} />;
    case 'Erzeugt durch':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Inhaltlich abhängig':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    case 'Entscheidungsrelevant bei':
      return <Avatar style={{ backgroundColor: '#ffd442' }} icon={<NotificationOutlined />} />;
    case 'Sonstiges':
      return <Avatar style={{ backgroundColor: '#5f5f5f' }} icon={<TagsOutlined />} />;
    // Referenz Rollen
    case 'Aufgaben und Befugnisse':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    case 'Fähigkeitsprofil':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    case 'Rollenbesetzung':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    case 'Verantwortlich für':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    case 'Wirkt mit bei':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    // Referenz Abläufe
    case 'Zugeordnete Produkte':
      return <Avatar style={{ backgroundColor: '#e71937' }} icon={<PartitionOutlined rotate={180} />} />;
    // Referenz Tailoring
    case 'Projektdurchführungsstrategie':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Projektmerkmale':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Ausgewählte Vorgehensbausteine':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Ausgewählte Ablaufbausteine':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    // Referenz Arbeitshilfen
    case 'Produkt':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Werkzeuge':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Arbeitsschritte':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    case 'Methoden':
      return <Avatar style={{ backgroundColor: '#689fd0' }} icon={<ToolOutlined />} />;
    default:
      return '';
  }
}

function DataTable(props: { data: TableEntry[] }) {
  if (props.data?.length > 0) {
    return (
      <List
        itemLayout="horizontal"
        dataSource={props.data}
        renderItem={(item: TableEntry) => (
          <List.Item>
            <List.Item.Meta
              avatar={renderSwitch(item.descriptionEntry)}
              title={item.descriptionEntry}
              description={item.dataEntry}
            />
          </List.Item>
        )}
        style={{ padding: '0 1rem' }}
      />
    );
  } else {
    return null;
  }
}

function PageEntryContent(props: { ctrl: ContentController }) {
  const { id } = useParams<{ id: string }>();
  const product = props.ctrl.getPageEntryContent(parseInt(id, 10));

  menuEntryFound = {
    // empty dummy entry
    menuEntry: { id: -1, displayName: '' },
    depth: 0,
  };

  for (const menuEntry of MENU_DATA) {
    const menu = findMenuEntry(menuEntry, parseInt(id, 10), 0);
    if (menu !== undefined) {
      menuEntryFound = menu;
      break;
    }
  }

  let productData;

  const productDataArray = [];

  if (product || menuEntryFound.menuEntry.id > -1) {
    productDataArray.push(
      <div key={product?.menuEntryId.toString()}>
        <h2 id={product?.menuEntryId.toString()}> {product?.header} </h2>
        <p>{product?.descriptionText}</p>
        <DataTable data={product?.tableEntries} />
      </div>
    );

    if (menuEntryFound?.depth >= 3 && menuEntryFound.menuEntry?.subMenuEntries) {
      for (const menuEntryChildren of menuEntryFound.menuEntry.subMenuEntries) {
        const productChild = props.ctrl.getPageEntryContent(menuEntryChildren.id);

        productDataArray.push(
          <div key={productChild?.menuEntryId.toString()} style={{ marginTop: '40px' }}>
            <h3 id={productChild?.menuEntryId.toString()}> {productChild.header} </h3>
            <p>{productChild?.descriptionText}</p>
            <DataTable data={productChild?.tableEntries} />
          </div>
        );
      }
    }
    productData = productDataArray;
  } else {
    productData = <h2> Sorry. Product doesn't exist </h2>;
  }

  return (
    <div>
      <div>{productData}</div>
    </div>
  );
}

export class ContentComponent extends ReactComponent<unknown, ContentController> implements GenericComponent {
  public ctrl: ContentController = new ContentController();

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new ContentController(this.forceUpdate.bind(this));
  }

  public componentWillMount(): void {
    this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    return (
      <>
        {this.ctrl.pageEntry && (
          <>
            <Layout style={{ background: '#FFF' }}>
              <Row>
                <Col
                  style={{ display: 'flex', flexDirection: 'column' }}
                  xs={{ span: 24, order: 2 }}
                  lg={{ span: 16, order: 1 }}
                >
                  <div style={{ padding: '24px', flex: '1 0 auto' }}>
                    <PageEntryContent ctrl={this.ctrl} />
                  </div>
                  <FooterComponent />
                </Col>
                <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
                  <AnchorList />
                  <BackTop />
                </Col>
              </Row>
            </Layout>
          </>
        )}
      </>
    );
  }
}
