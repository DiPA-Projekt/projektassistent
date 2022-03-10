import 'antd/dist/antd.css';

import { Avatar, List } from 'antd';
import parse from 'html-react-parser';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PartitionOutlined } from '@ant-design/icons';
import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { RolesContentController } from './controller';
import { DataEntry, PageEntry, TableEntry } from '../../../../../../openapi';

// Tiny helper interface
interface MenuEntryDepth {
  menuEntry: MenuEntry;
  depth: number;
}

export let menuEntryFound: MenuEntryDepth;

function findMenuEntry(menuEntry: MenuEntry, menuEntryId: string, depth: number): MenuEntryDepth | null {
  if (menuEntry.id === menuEntryId) {
    return { menuEntry, depth };
  }

  if (menuEntry.subMenuEntries) {
    for (const subMenuEntry of menuEntry.subMenuEntries) {
      const menuEntryWithDepth = findMenuEntry(subMenuEntry, menuEntryId, depth + 1);
      if (menuEntryWithDepth !== null) {
        return menuEntryWithDepth;
      }
    }
  }
  return null;
}

const icons: Map<string, { color: string; icon: JSX.Element }> = new Map<
  string,
  { color: string; icon: JSX.Element }
>();
// Referenz Rollen
icons.set('Aufgaben und Befugnisse', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Fähigkeitsprofil', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Rollenbesetzung', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Verantwortlich für', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Wirkt mit bei', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });

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

// function Component(props) {
//   return delayed_render(async () => {
//     /* any rendering code with awaits... */
//   });
// }

function SubEntries(props: { data: PageEntry; ctrl: RolesContentController }) {
  return delayed_render(async () => {
    const productDataArray = [];

    // console.log('data', props.data);
    if (props.data?.subPageEntries && props.data.subPageEntries.length > 0) {
      for (const menuEntryChildren of props.data?.subPageEntries) {
        // const productChild = props.ctrl.getPageEntryContent(menuEntryChildren.id);

        // const getThemaContent = async () => {
        //   const test = await props.ctrl.getThemaContent(menuEntryChildren?.menuEntryId);
        //   return test;
        //   // const json = await res.json();
        //   // setVal(json.answer);
        // };

        const subEntries = await props.ctrl.getThemaContent(menuEntryChildren?.menuEntryId);

        // console.log('subEntries', subEntries);

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
  });
}

function PageEntryContent(props: { ctrl: RolesContentController }) {
  const { id } = useParams<{ id: string }>();

  props.ctrl.setId(id);

  // const product = props.ctrl.getPageEntryContent(id);
  // const product = props.ctrl.getPageEntryContent2();

  // menuEntryFound = {
  //   // empty dummy entry
  //   menuEntry: { id: -1, displayName: '' },
  //   depth: 0,
  // };

  // for (const menuEntry of props.ctrl.menuEntries) {
  //   const menu = findMenuEntry(menuEntry, id, 0);
  //   if (menu !== null) {
  //     menuEntryFound = menu;
  //     break;
  //   }
  // }

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

export class RolesContentComponent extends ReactComponent<unknown, RolesContentController> implements GenericComponent {
  public ctrl: RolesContentController = new RolesContentController();

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new RolesContentController(this.forceUpdate.bind(this));
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
