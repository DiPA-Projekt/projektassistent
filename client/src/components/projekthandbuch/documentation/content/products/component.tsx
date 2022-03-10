import 'antd/dist/antd.css';

import { Avatar, List } from 'antd';
import parse from 'html-react-parser';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

import { ProductContentController } from './controller';
import { DataEntry, PageEntry, TableEntry } from '../../../../../../openapi';

// Tiny helper interface
interface MenuEntryDepth {
  menuEntry: MenuEntry;
  depth: number;
}

export let productMenuEntryFound: MenuEntryDepth;

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

function delayed_render(async_fun, deps = []) {
  const [output, setOutput] = useState();

  useEffect(async () => setOutput(await async_fun()), deps);
  return output === undefined ? null : output;
}

function SubEntries(props: { data: PageEntry; ctrl: ProductContentController }) {
  return delayed_render(async () => {
    const productDataArray = [];

    if (props.data?.subPageEntries && props.data.subPageEntries.length > 0) {
      for (const menuEntryChildren of props.data?.subPageEntries) {
        const subEntries = await props.ctrl.getThemaContent(menuEntryChildren?.menuEntryId);

        productDataArray.push(
          <div key={menuEntryChildren?.menuEntryId.toString()} style={{ marginTop: '40px' }}>
            <h3 id={menuEntryChildren?.menuEntryId.toString()}> {menuEntryChildren.displayName} </h3>
            {parse(subEntries)}
          </div>
        );
      }
    }

    return <div>{productDataArray}</div>;
  }, [props.data]);
}

function PageEntryContent(props: { ctrl: ProductContentController }) {
  const menuEntryFound = props.ctrl.getPageEntryContent2();

  productMenuEntryFound = menuEntryFound;

  let productData;
  const productDataArray = [];

  if (menuEntryFound?.menuEntryId) {
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
    productData = <></>;
  }

  return (
    <div>
      <div>{productData}</div>
    </div>
  );
}

interface CallbackProps {
  (): void;
}

export class ProductContentComponent
  extends ReactComponent<CallbackProps, ProductContentController>
  implements GenericComponent
{
  public ctrl: ProductContentController = new ProductContentController();

  public constructor(props: CallbackProps) {
    super(props);
    this.ctrl = new ProductContentController(this.forceUpdate.bind(this));
    this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    return (
      <>
        <PageEntryContent ctrl={this.ctrl} />
      </>
    );
  }
}
