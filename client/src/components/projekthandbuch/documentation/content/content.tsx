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
import parse from 'html-react-parser';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentation } from '../../../../context/DocumentationContext';
import { decodeXml, getJsonDataFromXml, replaceUmlaute } from '../../../../shares/utils';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';

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

  const {
    selectedPageEntry,
    setSelectedPageEntry,
    disciplineId,
    productId,
    roleId,
    decisionPointId,
    processModuleId,
    methodReferenceId,
    toolReferenceId,
    processBuildingBlockId,
    entryId,
  } = useDocumentation();

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

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (roleId) {
        const content = await getRoleContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no roleId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [roleId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (processBuildingBlockId) {
        const content = await getTailoringProcessBuildingBlocksContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no processBuildingBlockId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [processBuildingBlockId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (decisionPointId) {
        const content = await getDecisionPointContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no decisionPointId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [decisionPointId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (processModuleId) {
        const content = await getProcessModuleContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no processModuleId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [processModuleId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (methodReferenceId) {
        const content = await getMethodReferenceContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no methodReferenceId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [methodReferenceId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (toolReferenceId) {
        const content = await getToolReferenceContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no toolReferenceId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [toolReferenceId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (entryId) {
        const content = await fetchSectionDetailsData(entryId);
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no productId && disciplineId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [entryId]);

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

  function replaceUrlInText(testString: string): string {
    //vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/fc3fc9d51ffd42/
    // Projekttyp/1369cfd47f59793/Projekttypvariante/c3cdfb31207000/
    // Grafik/images/VB_11340f6a5201855.gif?bee411a076e64a5=5acd11a076eaf06&be9c11a076f10fa=faaf11a076f5da4&ca2711ba30b787e=17af711ba30b787e&cd7015dbcc3dcdf=105b315dbcc3dcdf&7a0a11a076fa61b=a36711a0771b07e&de9d11a07700334=47bd11a07723bec&1261411a077061c3=547611a07727f2d&559a15dc26b0e8a=2dc715dc26b0e8a&cd5511a07709e6b=1600811a0772cdb4&25f211a0770d36d=47a111a0772f0e4&10f4e11a07712fb9=aa7811a07736a7c

    const imageUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Grafik/images/$2?' +
      getProjectFeaturesString();

    // testString.replace(/<img([^>]*)\ssrc=(['"])(?:[^\2\/]*\/)*([^\2]+)\2/gi, '<img$1 src=$2newPath/$3$2');

    testString.replace(/(<img *src=")(.*?)"/, imageUrl);

    return testString.replace(
      /src=['"](?:[^"'\/]*\/)*([^'"]+)['"]/g,
      'src="https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        modelVariantId +
        '/Projekttyp/' +
        projectTypeId +
        '/Projekttypvariante/' +
        projectTypeVariantId +
        '/Grafik/images/$1?' +
        getProjectFeaturesString() +
        '"'
    );
  }

  async function fetchSectionDetailsData(sectionId: string): Promise<any> {
    const sectionDetailUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Kapitel/' +
      sectionId;

    const jsonDataFromXml: any = await getJsonDataFromXml(sectionDetailUrl);
    const textPart = decodeXml(jsonDataFromXml.children.find((child: any) => child.name === 'Text')?.value);

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.titel,
      descriptionText: replaceUrlInText(textPart),
      tableEntries: [],
      subPageEntries: [],
    };
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

  ////////////////////////////////////

  async function getRoleContent(): Promise<PageEntry> {
    const url =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Rolle/' +
      roleId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    return axios.get(url).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(replaceUmlaute(response.data));

      const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);
      const tasksAndAuthorities = jsonDataFromXml.getElementsByTagName('Aufgaben_und_Befugnisse')[0]?.value;
      const skillProfile = jsonDataFromXml.getElementsByTagName('Faehigkeitsprofil')[0]?.value;
      const cast = jsonDataFromXml.getElementsByTagName('Rollenbesetzung')[0]?.value;

      const rolleVerantwortetProduktRefs: XMLElement[] =
        jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRefs');
      const rolleWirktMitBeiProduktRefs: XMLElement[] =
        jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRefs');

      const tableEntries: TableEntry[] = [];

      if (tasksAndAuthorities) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Aufgaben und Befugnisse',
          dataEntries: [{ title: decodeXml(tasksAndAuthorities) }],
        });
      }
      if (skillProfile) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Fähigkeitsprofil',
          dataEntries: [{ title: decodeXml(skillProfile) }],
        });
      }
      if (cast) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Rollenbesetzung',
          dataEntries: [{ title: decodeXml(cast) }],
        });
      }

      // //////////////////////////////////////////////
      //
      const rolesInCharge = rolleVerantwortetProduktRefs.flatMap((entry: XMLElement) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (rolesInCharge.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Verantwortlich für',
          dataEntries: rolesInCharge,
        });
      }

      // //////////////////////////////////////////////

      const rolesTakePart = rolleWirktMitBeiProduktRefs.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (rolesTakePart.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Wirkt mit bei',
          dataEntries: rolesTakePart,
        });
      }

      //////////////////////////////////////////////

      // console.log('this.pageEntry roles', this.pageEntry);

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: description,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
  }

  async function getDecisionPointContent(): Promise<PageEntry> {
    const tailoringProcessBuildingBlocksUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Entscheidungspunkt/' +
      decisionPointId +
      '?' +
      getProjectFeaturesString();

    // let idCounter = 2000;

    const jsonDataFromXml: any = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    let idCounter = 2000;

    // TODO
    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

    const entscheidungspunktZuProduktRef = jsonDataFromXml.getElementsByTagName('EntscheidungspunktZuProduktRef');

    const tableEntries: TableEntry[] = [];

    const products = entscheidungspunktZuProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('ProduktRef').map((productRef) => {
        return {
          id: productRef.attributes.id,
          title: productRef.attributes.name,
        };
      });
    });

    if (products.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Zugeordnete Produkte',
        dataEntries: products,
      });
    }

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: sinnUndZweck,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  async function getProcessModuleContent(): Promise<PageEntry> {
    const processModuleUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Ablaufbaustein/' +
      processModuleId +
      '?' +
      getProjectFeaturesString();

    // let idCounter = 2000;

    const jsonDataFromXml: any = await getJsonDataFromXml(processModuleUrl);

    console.log('getProcessModuleContent', jsonDataFromXml);

    const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

    // let idCounter = 2000;
    //
    // const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
    //
    // const entscheidungspunktZuProduktRef = jsonDataFromXml.getElementsByTagName('EntscheidungspunktZuProduktRef');

    const tableEntries: TableEntry[] = [];

    // const products = entscheidungspunktZuProduktRef.flatMap((entry) => {
    //   return entry.getElementsByTagName('ProduktRef').map((productRef) => {
    //     return {
    //       id: productRef.attributes.id,
    //       title: productRef.attributes.name,
    //     };
    //   });
    // });

    // if (products.length > 0) {
    //   tableEntries.push({
    //     id: (idCounter++).toString(),
    //     descriptionEntry: 'Zugeordnete Produkte',
    //     dataEntries: products,
    //   });
    // }

    //////////////////////////////////////////////

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: description,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  async function getTailoringProcessBuildingBlocksContent(): Promise<PageEntry> {
    const tailoringProcessBuildingBlocksUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Vorgehensbaustein/' +
      processBuildingBlockId +
      '?' +
      getProjectFeaturesString();

    // let idCounter = 2000;

    const jsonDataFromXml: any = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

    const tableEntries: TableEntry[] = [];

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: sinnUndZweck,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  async function getMethodReferenceContent(): Promise<PageEntry> {
    const methodReferenceUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Methodenreferenz/' +
      methodReferenceId;

    // const jsonDataFromXml: any = await getJsonDataFromXml(methodReferenceUrl);

    let idCounter = 2000;

    return axios.get(methodReferenceUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(replaceUmlaute(response.data));

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

      const quelleRefs: XMLElement[] = jsonDataFromXml.getElementsByTagName('QuelleRefs');

      const tableEntries: TableEntry[] = [];

      // //////////////////////////////////////////////
      //
      const quellen = quelleRefs.flatMap((entry: XMLElement) => {
        return entry.getElementsByTagName('QuelleRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (quellen.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Quellen',
          dataEntries: quellen,
        });
      }

      //////////////////////////////////////////////

      // console.log('this.pageEntry roles', this.pageEntry);

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
  }

  async function getToolReferenceContent(): Promise<PageEntry> {
    const toolReferenceUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Werkzeugreferenz/' +
      toolReferenceId;

    // const jsonDataFromXml: any = await getJsonDataFromXml(methodReferenceUrl);

    return axios.get(toolReferenceUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(replaceUmlaute(response.data));

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

      const tableEntries: TableEntry[] = [];

      //////////////////////////////////////////////

      // console.log('this.pageEntry roles', this.pageEntry);

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
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
            {/*<FooterComponent />*/}
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
