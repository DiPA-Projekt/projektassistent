import 'antd/dist/antd.css';

import { Avatar, BackTop, Col, Layout, List, Row } from 'antd';
import React, { useEffect, useState } from 'react';
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
import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { FooterComponent } from '../../../footer/component';
import { AnchorList } from '../anchorList/component';
import { ContentController } from './controller';

import { ProductContentComponent } from './products/component';

// import { productMenuEntryFound } from './products/component';

import { RolesContentComponent } from './roles/component';
import { ProcessContentComponent } from './processes/component';
import { TailoringContentComponent } from './tailoring/component';
import { withRouter } from 'react-router';
import parse from 'html-react-parser';
import { DataEntry, PageEntry, TableEntry } from '../../../../../openapi';
import { ProductContentController } from './products/controller';

// Tiny helper interface
interface MenuEntryDepth {
  menuEntry: MenuEntry;
  depth: number;
}

export let menuEntryFound: MenuEntryDepth;

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
      entries.push(<span style={{ marginRight: '20px' }}>{parse(entryItem.title)}</span>);
    }
  });

  return <>{entries}</>;
}

function DataTable(props: { data: TableEntry[] }) {
  if (props && props.data?.length > 0) {
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

function delayed_render(async_fun, deps = []) {
  const [output, setOutput] = useState();

  // setOutput(undefined);

  // console.log('delayed_output', output);

  useEffect(async () => setOutput(await async_fun()), deps);
  return output === undefined ? null : output;
}

function SubEntries(props: { data: PageEntry; ctrl: ContentController }) {
  return delayed_render(async () => {
    const productDataArray = [];
    // console.log('delayed_render');

    if (props.data?.subPageEntries && props.data.subPageEntries.length > 0) {
      for (const menuEntryChildren of props.data?.subPageEntries) {
        const subEntries = await props.ctrl.getThemaContent(menuEntryChildren?.menuEntryId);

        // console.log('subEntries', menuEntryChildren?.menuEntryId.toString());

        productDataArray.push(
          <div key={menuEntryChildren?.menuEntryId.toString()} style={{ marginTop: '40px' }}>
            <h3 id={menuEntryChildren?.menuEntryId.toString()}> {menuEntryChildren.displayName} </h3>
            {parse(subEntries)}
            {/*<p>{props.ctrl.getThemaContent(menuEntryChildren?.menuEntryId)}</p>*/}
            {/*<DataTable data={productChild?.tableEntries} />*/}
          </div>
        );
      }
    }

    // const resp = await fetch(props.targetURL); // await here is OK!
    // const json = await resp.json();

    return <div>{productDataArray}</div>;

    // return <Child data={json} />;
  }, [props.data]);
}

function PageEntryContent(props: { ctrl: ContentController }) {
  const { id } = useParams<{ id: string }>();

  props.ctrl.setId(id);

  // menuEntryFound = productMenuEntryFound;
  // console.log('11111111 update menuEntryFound', menuEntryFound, props.ctrl.get);

  // function cbFunc(value: MenuEntryDepth) {
  //   console.log('callback', value);
  //   menuEntryFound = value;
  // }

  // const searchBarProps = {
  //   // make sure all required component's inputs/Props keys&types match
  //   callback: cbFunc,
  // };

  // const renderedContent = (
  //   <>
  //     {/*<ProductContentComponent />*/}
  //     {/*<RolesContentComponent callback={callback} />*/}
  //     {/*<ProcessContentComponent callback={callback} />*/}
  //     {/*<TailoringContentComponent callback={callback} />*/}
  //     <ProductContentComponent />
  //     <RolesContentComponent />
  //     <ProcessContentComponent />
  //     <TailoringContentComponent />
  //   </>
  // );
  //
  // return renderedContent;

  menuEntryFound = props.ctrl.getPageEntryContent2();

  let productData;

  const productDataArray = [];

  // console.log('key menuEntryFound', menuEntryFound);

  if (menuEntryFound && menuEntryFound?.menuEntryId) {
    productDataArray.push(
      <div key={menuEntryFound?.menuEntryId.toString()}>
        <h2 id={menuEntryFound?.menuEntryId.toString()}> {menuEntryFound?.header} </h2>
        {parse(menuEntryFound?.descriptionText)}
        <DataTable data={menuEntryFound?.tableEntries} />
      </div>
    );

    productDataArray.push(<SubEntries data={menuEntryFound} ctrl={props.ctrl}></SubEntries>);

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

@withRouter
export class ContentComponent extends ReactComponent<unknown, ContentController> implements GenericComponent {
  public ctrl: ContentController = new ContentController();

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new ContentController(this.forceUpdate.bind(this));

    // this.handler = this.handler.bind(this)
    this.ctrl.onInit();
  }

  public componentDidMount(): void {
    // this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    this.ctrl.onDestroy();
  }

  public async componentDidUpdate(prevProps): void {
    if (this.props.location !== prevProps.location) {
      // menuEntryFound =
      this.ctrl.onRouteChanged(this.props.match.params.id);
      // console.log('documentation content componentDidUpdate', this.menuEntryFound);

      // this.setState({ content: menuEntryFound });
    }
  }

  public render(): JSX.Element {
    return (
      // <>
      //   {this.ctrl.pageEntry && (
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
      //   )}
      // </>
    );
  }
}
