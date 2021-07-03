import 'antd/dist/antd.css';

import { Avatar, BackTop, Col, Layout, List, Row } from 'antd';
import parse from 'html-react-parser';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

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
import { DataEntry, MenuEntry, TableEntry } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { FooterComponent } from '../../../footer/component';
import { AnchorList } from '../anchorList/component';
import MENU_DATA from '../navigation/menu.data.json';
import { ContentController } from './controller';

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

const icons: Map<string, { color: string; icon: JSX.Element }> = new Map<
  string,
  { color: string; icon: JSX.Element }
>();
// Referenz Produkte
icons.set('Verantwortlich', { color: '#87d068', icon: <UserOutlined /> });
icons.set('Mitwirkend', { color: '#ff7f36', icon: <TeamOutlined /> });
icons.set('Hilfsmittel', { color: '#689fd0', icon: <MedicineBoxOutlined /> });
icons.set('Teil von', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Besteht aus', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Produktumfang', { color: '#689fd0', icon: <MedicineBoxOutlined /> });
icons.set('Erzeugt', { color: '#689fd0', icon: <FolderAddOutlined /> });
icons.set('Erzeugt durch', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Inhaltlich abhängig', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Entscheidungsrelevant bei', { color: '#ffd442', icon: <NotificationOutlined /> });
icons.set('Sonstiges', { color: '#5f5f5f', icon: <TagsOutlined /> });
// Referenz Rollen
icons.set('Aufgaben und Befugnisse', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Fähigkeitsprofil', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Rollenbesetzung', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Verantwortlich für', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Wirkt mit bei', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
// Referenz Abläufe;
icons.set('Zugeordnete Produkte', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
// Referenz Tailoring
icons.set('Projektdurchführungsstrategie', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Projektmerkmale', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Ausgewählte Vorgehensbausteine', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Ausgewählte Ablaufbausteine', { color: '#689fd0', icon: <ToolOutlined /> });
// Referenz Arbeitshilfen
icons.set('Produkt', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Werkzeuge', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Arbeitsschritte', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Methoden', { color: '#689fd0', icon: <ToolOutlined /> });

function renderSwitch(param: string) {
  const icon = icons.get(param);
  return <Avatar style={{ backgroundColor: icon?.color }} icon={icon?.icon} />;
}

function getTableEntriesList(inputData: DataEntry[]): JSX.Element {
  const entries: JSX.Element[] = [];

  inputData.map((entryItem: DataEntry, index: number) => {
    if (entryItem?.type === 'bold' && entryItem.menuEntryId) {
      entries.push(
        <div key={`table-item-${index}`}>
          <Link style={{ fontWeight: 'bold' }} to={`./${entryItem.menuEntryId}`}>
            {entryItem.title}
          </Link>
          {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
        </div>
      );
    } else if (entryItem?.menuEntryId) {
      entries.push(
        <span style={{ marginRight: '20px' }} key={`table-item-${index}`}>
          <Link to={`./${entryItem.menuEntryId}`}>{entryItem.title}</Link>
          {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
        </span>
      );
    } else {
      entries.push(<span style={{ marginRight: '20px' }}>{entryItem.title}</span>);
    }
  });

  return <>{entries}</>;
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
              description={getTableEntriesList(item?.dataEntries)}
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
        <p>{parse(product?.descriptionText)}</p>
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
