// import 'antd/dist/antd.css';

import { Anchor, Avatar, Col, FloatButton, Layout, List, Row } from 'antd';
import React, { useEffect, useState } from 'react';

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
import { DataEntry, PageEntry, TableEntry } from '@dipa-projekt/projektassistent-openapi';
// import { GenericComponent } from '@leanup/lib';
// import { ReactComponent } from '@leanup/lib';
import { FooterComponent } from '../../../footer/component';

import parse from 'html-react-parser';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentation } from '../../../../context/DocumentationContext';
import { decodeXml, getJsonDataFromXml } from '../../../../shares/utils';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';

// export let pageEntryFound: PageEntry;

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

interface MyType {
  [key: string]: string;
}

// @withRouter
export function Content() {
  // public ctrl: ContentController = new ContentController();

  const [searchParams, setSearchParams] = useSearchParams();
  // TODO: just temporary from search params
  const modelVariantId = searchParams.get('mV');
  const projectTypeVariantId = searchParams.get('ptV');
  const projectTypeId = searchParams.get('pt');
  const projectFeatureIdsSearchParam: MyType = {};

  searchParams.forEach((value, key) => {
    if (!['mV', 'ptV', 'pt'].includes(key)) {
      projectFeatureIdsSearchParam[key] = value;
    }
  });

  const { selectedPageEntry, setSelectedPageEntry, disciplineId, productId } = useDocumentation();

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (productId && disciplineId) {
        const content = await getProductContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no productId && disciplineId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [productId]);

  function renderSwitch(param: string) {
    const icon = icons.get(param);
    return <Avatar style={{ backgroundColor: icon?.color }} icon={icon?.icon} />;
  }

  function getTableEntriesList(inputData: DataEntry[]): JSX.Element {
    const entries: JSX.Element[] = [];

    inputData.map((entryItem) => {
      // if (entryItem?.type === 'bold' && entryItem.id) {
      //   entries.push(
      //     <div key={`table-item-${index}`}>
      //       <Link style={{ fontWeight: 'bold' }} to={`./${entryItem.id}`}>
      //         {entryItem.title}
      //       </Link>
      //       {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
      //     </div>
      //   );
      // } else
      if (entryItem?.id) {
        entries.push(
          <span style={{ marginRight: '20px' }} key={`table-item-${entryItem.id}`}>
            <Link to={`./${entryItem.id}`}>{entryItem.title}</Link>
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

  function delayed_render(
    async_fun: {
      (): Promise<JSX.Element>;
      (): React.SetStateAction<undefined> | PromiseLike<React.SetStateAction<undefined>>;
    },
    deps = []
  ) {
    const [output, setOutput] = useState();

    useEffect(async () => setOutput(await async_fun()), deps);
    return output === undefined ? null : output;
  }

  function SubEntries(props: { data: PageEntry }) {
    return delayed_render(async () => {
      const productDataArray = [];

      if (props.data?.subPageEntries && props.data.subPageEntries.length > 0) {
        for (const menuEntryChildren of props.data?.subPageEntries) {
          const subEntries = await getTopicContent(menuEntryChildren?.id);

          productDataArray.push(
            <div key={menuEntryChildren?.id} style={{ marginTop: '40px' }}>
              <h3 id={menuEntryChildren?.id}> {menuEntryChildren.header} </h3>
              {parse(subEntries)}
            </div>
          );
        }
      }
      return <div>{productDataArray}</div>;
    }, [props.data]);
  }

  async function getTopicContent(topicId: string): Promise<string> {
    const topicUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '/Thema/' +
      topicId +
      '?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(topicUrl);
    const description = jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
    return decodeXml(description);
  }

  // useEffect(() => {
  //   console.log('selectedPageEntry changed', selectedPageEntry);
  //
  //   pageEntryFound = selectedPageEntry;
  // }, [selectedPageEntry]);

  function PageEntryContent() {
    // pageEntryFound = selectedPageEntry;
    // console.log('pageEntryFound', pageEntryFound);

    let productData;

    const productDataArray = [];

    if (selectedPageEntry && selectedPageEntry?.id) {
      productDataArray.push(
        <div key={selectedPageEntry?.id}>
          <h2 id={selectedPageEntry?.id}> {selectedPageEntry?.header} </h2>
          {parse(selectedPageEntry?.descriptionText)}
          <DataTable data={selectedPageEntry?.tableEntries} />
        </div>
      );

      productDataArray.push(<SubEntries data={selectedPageEntry} />);

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

  // public componentDidUpdate(prevProps: { location: any }): void {
  //   // if (this.props.location !== prevProps.location) {
  //   //   // this.ctrl.onRouteChanged(this.props.match.params.id);
  //   // }
  // }

  ///////////////////////////////
  ///////////////////////////////

  function getProjectFeaturesString(): string {
    return Object.keys(projectFeatureIdsSearchParam)
      .map((key: string) => {
        return `${key}=${projectFeatureIdsSearchParam[key]}`;
      })
      .join('&');
  }

  async function getProductContent(): Promise<PageEntry> {
    const productUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '?' +
      getProjectFeaturesString();

    console.log(productUrl);

    const jsonDataFromXml: any = await getJsonDataFromXml(productUrl);

    let idCounter = 2000;

    //   if (!this.disciplineId) {
    //   // TODO: nicht unbedingt reject
    //   return Promise.reject(Error('no discipline id set'));
    // }

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
    const rolleVerantwortetProduktRef = jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRef');
    const rolleWirktMitBeiProduktRef = jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRef');
    const produktZuEntscheidungspunktRef = jsonDataFromXml.getElementsByTagName('ProduktZuEntscheidungspunktRef');
    const themaZuProduktRef = jsonDataFromXml.getElementsByTagName('ThemaZuProduktRef');
    const aktivitaetRef = jsonDataFromXml.getElementsByTagName('AktivitaetZuProduktRef');
    const externeKopiervorlageZuProduktRef = jsonDataFromXml.getElementsByTagName('ExterneKopiervorlageZuProduktRef');

    const tableEntries: TableEntry[] = [];
    // const subPageEntries = [];

    //////////////////////////////////////////////

    const rolesInCharge = rolleVerantwortetProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('RolleRef').map((roleRef) => {
        return {
          id: roleRef.attributes.id,
          title: roleRef.attributes.name,
        };
      });
    });

    if (rolesInCharge.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Verantwortlich', //rolleVerantwortetProduktRef[0]?.attributes.name,
        dataEntries: rolesInCharge,
      });
    }

    //////////////////////////////////////////////

    const rolesTakePart = rolleWirktMitBeiProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('RolleRef').map((roleRef) => {
        return {
          id: roleRef.attributes.id,
          title: roleRef.attributes.name,
        };
      });
    });

    if (rolesTakePart.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Mitwirkend', //rolleWirktMitBeiProduktRef[0]?.attributes.name,
        dataEntries: rolesTakePart,
      });
    }

    //////////////////////////////////////////////

    const activities = aktivitaetRef.flatMap((entry) => {
      return entry.getElementsByTagName('AktivitaetRef').map((activityRef) => {
        return {
          id: activityRef.attributes.id,
          // menuEntryId: activityRef.attributes.id,
          title: activityRef.attributes.name,
          suffix: '(Aktivität)',
        };
      });
    });

    const products = externeKopiervorlageZuProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('ExterneKopiervorlageRef').map((productRef) => {
        return {
          id: productRef.attributes.id,
          // menuEntryId: productRef.attributes.id,
          title: productRef.attributes.name,
          suffix: '(Externe Kopiervorlage)',
        };
      });
    });

    const tools = [...activities, ...products];
    // console.log('Tools', tools);

    if (tools.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Hilfsmittel', //produktZuEntscheidungspunktRef[0]?.attributes.name,
        dataEntries: tools,
      });
    }

    //////////////////////////////////////////////

    const decisionPoints = produktZuEntscheidungspunktRef.flatMap((entry) => {
      return entry.getElementsByTagName('EntscheidungspunktRef').map((decisionPointRef) => {
        return {
          id: decisionPointRef.attributes.id,
          title: decisionPointRef.attributes.name,
        };
      });
    });

    if (decisionPoints.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Entscheidungsrelevant bei', //produktZuEntscheidungspunktRef[0]?.attributes.name,
        dataEntries: decisionPoints,
      });
    }

    //////////////////////////////////////////////
    // +++++++++++++++++++++++++++++++++++++++++++
    //////////////////////////////////////////////
    const subPageEntries = themaZuProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('ThemaRef').map((subjectRef) => {
        return {
          id: subjectRef.attributes.id,
          header: subjectRef.attributes.name,
        };
      });
    });

    //////////////////////////////////////////////
    // +++++++++++++++++++++++++++++++++++++++++++
    //////////////////////////////////////////////

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: sinnUndZweck,
      tableEntries: tableEntries,
      subPageEntries: subPageEntries,
    };
  }

  ////////////////////////
  ////////////////////////

  function getAnchorItems(): AnchorLinkItemProps[] {
    const anchorItems =
      selectedPageEntry.subPageEntries?.map((productChild: PageEntry) => {
        return {
          key: productChild.id,
          href: `#${productChild.id}`,
          title: productChild.header,
        };
      }) || [];

    const anchorList: AnchorLinkItemProps = {
      key: selectedPageEntry.id,
      href: `#${selectedPageEntry.id}`,
      title: selectedPageEntry.header,
      children: anchorItems,
    };

    return [anchorList];
  }

  return (
    <>
      <Layout style={{ background: '#FFF' }}>
        <Row>
          <Col
            style={{ display: 'flex', flexDirection: 'column' }}
            xs={{ span: 24, order: 2 }}
            lg={{ span: 16, order: 1 }}
          >
            <div style={{ padding: '24px', flex: '1 0 auto' }}>{<PageEntryContent />}</div>
            <FooterComponent />
          </Col>
          <Col xs={{ span: 24, order: 1 }} lg={{ span: 8, order: 2 }}>
            {selectedPageEntry && (
              <div style={{ position: 'sticky', top: 0, overflow: 'auto' }}>
                <h3 style={{ paddingLeft: '16px' }}>Seitenübersicht</h3>
                <Anchor affix={false} onClick={(e) => e.nativeEvent.preventDefault()} items={getAnchorItems()} />
              </div>
            )}
            {/*<AnchorList />*/}
            <FloatButton.BackTop />
          </Col>
        </Row>
      </Layout>
    </>
  );
}
