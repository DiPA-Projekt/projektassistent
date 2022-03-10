import 'antd/dist/antd.css';

import { Avatar, List } from 'antd';
import parse from 'html-react-parser';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { PartitionOutlined } from '@ant-design/icons';
import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProcessContentController } from './controller';
import { DataEntry, TableEntry } from '../../../../../../openapi';

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
// Referenz Abläufe;
icons.set('Zugeordnete Produkte', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });

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

function PageEntryContent(props: { ctrl: ProcessContentController }) {
  const { id } = useParams<{ id: string }>();

  // props.ctrl.setId(id);

  menuEntryFound = props.ctrl.getPageEntryContent2();

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

export class ProcessContentComponent
  extends ReactComponent<unknown, ProcessContentController>
  implements GenericComponent
{
  public ctrl: ProcessContentController = new ProcessContentController();

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new ProcessContentController(this.forceUpdate.bind(this));
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
