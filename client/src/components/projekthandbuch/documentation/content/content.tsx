// import 'antd/dist/antd.css';

import { Anchor, Avatar, Col, FloatButton, Layout, List, Row, Spin, Table, TableProps, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

import {
  FolderAddOutlined,
  LinkOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DataEntry, PageEntry, TableEntry } from '@dipa-projekt/projektassistent-openapi';
// import { GenericComponent } from '@leanup/lib';
// import { ReactComponent } from '@leanup/lib';
import parse from 'html-react-parser';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentation } from '../../../../context/DocumentationContext';
import { decodeXml, flatten, getJsonDataFromXml } from '../../../../shares/utils';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { IndexTypeEnum, NavTypeEnum } from '../navigation/navigation';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useTailoring } from '../../../../context/TailoringContext';

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
icons.set('Verantwortliche und Produkte', { color: '#5f5f5f', icon: <ShoppingOutlined /> }); // TODO

// Referenz Rollen
icons.set('Aufgaben und Befugnisse', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Fähigkeitsprofil', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Rollenbesetzung', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Verantwortlich für', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Wirkt mit bei', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
// Referenz Abläufe;
icons.set('Zugeordnete Produkte', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Ablaufbausteine', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
// Referenz Tailoring
icons.set('Projektdurchführungsstrategie', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Projektmerkmale', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Ausgewählte Vorgehensbausteine', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Ausgewählte Ablaufbausteine', { color: '#689fd0', icon: <ToolOutlined /> });
// Referenz Arbeitshilfen
icons.set('Produkt', { color: '#689fd0', icon: <ShoppingOutlined /> });
icons.set('Werkzeuge', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Arbeitsschritte', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Methoden', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Aktivitäten', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Quellen', { color: '#689fd0', icon: <LinkOutlined /> });

export function Content() {
  // public ctrl: ContentController = new ContentController();

  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const {
    modelVariantId: tailoringModelVariantId,
    projectTypeVariantId: tailoringProjectTypeVariantId,
    projectTypeId: tailoringProjectTypeId,
    getProjectFeaturesQueryString: getProjectFeaturesString,
  } = useTailoring();

  const { t } = useTranslation();

  const QUESTION_HEADER =
    '<div style="margin-top: 40px;"><h3 id="questionHeader"> Frage (im Projektassistenten) </h3></div>';

  const sorter = (a: any, b: any) => (isNaN(a) && isNaN(b) ? (a || '').localeCompare(b || '') : a - b);

  const {
    navigationData,
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
    projectCharacteristicId,
    projectTypeId,
    projectTypeVariantId,
    projectTypeVariantSequenceId,
    activityId,
    templateDisciplineId,
    entryId,
    selectedIndexType,
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
      if (disciplineId) {
        const content = await getDisciplineContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no disciplineId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [disciplineId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (selectedIndexType) {
        let content;
        switch (selectedIndexType) {
          case IndexTypeEnum.PRODUCT:
            content = await getProductIndexContent();
            break;
          case IndexTypeEnum.ROLE:
            content = await getRoleIndexContent();
            break;
          case IndexTypeEnum.PROCESS:
            content = await getProcessIndexContent();
            break;
          case IndexTypeEnum.TAILORING:
            content = await getTailoringIndexContent();
            break;
          case IndexTypeEnum.WORK_AIDS:
            content = await getWorkAidsIndexContent();
            break;
        }
        setSelectedPageEntry(content);
      } else {
        console.log('no selectedIndexType');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [selectedIndexType]);

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
      if (projectCharacteristicId) {
        const content = await getProjectCharacteristicContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no projectCharacteristicId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [projectCharacteristicId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (projectTypeId) {
        const content = await getProjectTypeContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no projectTypeId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [projectTypeId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (projectTypeVariantId) {
        const content = await getProjectTypeVariantContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no projectTypeVariantId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [projectTypeVariantId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (projectTypeVariantSequenceId) {
        const content = await getProjectTypeVariantSequenceContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no projectTypeVariantSequenceId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [projectTypeVariantSequenceId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (activityId) {
        const content = await getActivityContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no activityId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [activityId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (templateDisciplineId) {
        const content = await getTemplatesContent();
        setSelectedPageEntry(content);
        console.log('setSelectedPageEntry', content);
      } else {
        console.log('no templateDisciplineId');
      }
    }

    mount().then();
    //eslint-disable-next-line
  }, [templateDisciplineId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (entryId) {
        setLoading(true);
        const content = await fetchSectionDetailsData(entryId);

        if (content.generatedContent === 'Elemente:Abkürzungen') {
          const content2 = await getAbbreviationsContent();
          console.log(content2);
          setSelectedPageEntry(content2);
        } else if (content.generatedContent === 'Elemente:Glossar') {
          const content2 = await getGlossaryContent();
          console.log(content2);
          setSelectedPageEntry(content2);
        } else if (content.generatedContent === 'Elemente:Quellen') {
          const content2 = await getLiteratureContent();
          console.log(content2);
          setSelectedPageEntry(content2);
        } else {
          setSelectedPageEntry(content);
          console.log('setSelectedPageEntry', content);
        }
        setLoading(false);
      } else {
        console.log('no entryId');
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

    inputData.map((entryItem: DataEntry) => {
      if (Array.isArray(entryItem)) {
        for (const entrySubItem of entryItem) {
          entries.push(
            <span
              style={{ fontWeight: 'bold', display: 'block' }}
              key={`table-sub-header-${entrySubItem.subheader.id}`}
            >
              {entrySubItem.subheader?.id ? (
                <Link to={`/documentation/${entrySubItem.subheader.id}${location.search}`}>
                  {entrySubItem.subheader.title}
                </Link>
              ) : (
                entrySubItem.subheader.title
              )}
            </span>
          );

          entrySubItem.dataEntries.map((innerEntryItem: DataEntry) => {
            if (innerEntryItem?.id) {
              entries.push(
                <span style={{ marginRight: '20px', display: 'inline-flex' }} key={`table-item-${innerEntryItem.id}`}>
                  <Link to={`/documentation/${innerEntryItem.id}${location.search}`}>{innerEntryItem.title}</Link>
                  {innerEntryItem.suffix && <span style={{ marginLeft: '5px' }}>{innerEntryItem.suffix}</span>}
                </span>
              );
            } else {
              entries.push(<span style={{ marginRight: '20px' }}>{parse(innerEntryItem.title)}</span>);
            }
          });
        }
      } else {
        if (entryItem?.id) {
          entries.push(
            <span style={{ marginRight: '20px', display: 'inline-flex' }} key={`table-item-${entryItem.id}`}>
              <Link to={`/documentation/${entryItem.id}${location.search}`}>{entryItem.title}</Link>
              {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
            </span>
          );
        } else {
          entries.push(<span style={{ marginRight: '20px' }}>{parse(entryItem.title)}</span>);
        }
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
          const subPageEntries = await getTopicContent(menuEntryChildren?.id);

          productDataArray.push(
            <div key={menuEntryChildren?.id} style={{ marginTop: '40px' }}>
              <h3 id={menuEntryChildren?.id}> {menuEntryChildren.header} </h3>
              {parse(subPageEntries.descriptionText)}
              <DataTable data={subPageEntries?.tableEntries} />
            </div>
          );
        }
      }
      return <div>{productDataArray}</div>;
    }, [props.data]);
  }

  async function getTopicContent(topicId: string): Promise<PageEntry> {
    const topicUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '/Thema/' +
      topicId +
      '?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(topicUrl);

    let idCounter = 2000;

    const description = jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;

    // get table
    const generatingDependencies = await getGeneratingDependenciesData();
    const tableEntries = [];
    const dataEntries = [];

    for (const generatingDependency of generatingDependencies) {
      // const generatingDependencyId = generatingDependency.attributes.id;
      const generatingDependencyTitle = generatingDependency.attributes.name;
      const generatingDependenciesData = [];

      const topics = generatingDependency.getElementsByTagName('ThemaRef');
      for (const topic of topics) {
        if (topic.attributes.id === topicId) {
          console.log('topic', topic.attributes.name);
          const products = generatingDependency.getElementsByTagName('ProduktRef');
          const productsToTopics = [];

          for (const product of products) {
            console.log('topic product', product.attributes.name);
            productsToTopics.push({
              id: product.attributes.id,
              title: product.attributes.name,
            });
          }

          generatingDependenciesData.push({
            subheader: { title: generatingDependencyTitle },
            dataEntries: productsToTopics,
          });
        }
      }
      if (generatingDependenciesData.length > 0) {
        dataEntries.push(generatingDependenciesData);
      }
    }
    if (dataEntries.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Erzeugt',
        dataEntries: dataEntries,
      });
      console.log('generatingDependenciesData', tableEntries);
    }

    // const products = generatingDependencies.getElementsByTagName('ProduktRef');
    // const topic = generatingDependencies.getElementsByTagName('ThemaRef');

    const textPart = decodeXml(description);

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: fixLinksInText(replaceUrlInText(textPart)),
      tableEntries: tableEntries,
    };
  }

  // useEffect(() => {
  //   console.log('selectedPageEntry changed', selectedPageEntry);
  //
  //   pageEntryFound = selectedPageEntry;
  // }, [selectedPageEntry]);

  async function getGeneratingDependenciesData(): Promise<XMLElement[]> {
    const generatingDependenciesUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/ErzeugendeAbhaengigkeit?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(generatingDependenciesUrl);

    return jsonDataFromXml.getElementsByTagName('ErzeugendeAbhängigkeit');
  }

  async function getResponsibleRolesForProducts(productIds: string[]): Promise<any[]> {
    const filterProductDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PRODUCT].includes(item.dataType)
    );

    // TODO: optimieren

    const responsibleRoleToProductsMap = new Map<string, { id: string; title: string }[]>();
    const responsibleRolesMap = new Map<string, string>();

    const productsToRoles = [];

    for (const productId of productIds) {
      const currentProduct = filterProductDataTypes.filter((product) => product.key === productId)?.[0];

      const responsibleRolesForProductsUrl =
        'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Projekttyp/' +
        tailoringProjectTypeId +
        '/Projekttypvariante/' +
        tailoringProjectTypeVariantId +
        '/Disziplin/' +
        currentProduct.parent.key +
        '/Produkt/' +
        currentProduct.key +
        '?' +
        getProjectFeaturesString();

      const jsonDataFromXml: any = await getJsonDataFromXml(responsibleRolesForProductsUrl);

      // products.push(jsonDataFromXml.getElementsByTagName('Produkt'));
      //
      // for (const product of products) {
      // const productTitle = currentProduct.label;
      // const productId = product.attributes.id;

      if (productIds.includes(currentProduct.key)) {
        const rolleVerantwortetProduktRef: XMLElement[] =
          jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRef');

        // TODO: ist immer nur eine Rolle
        const rolesInCharge = rolleVerantwortetProduktRef.flatMap((entry) => {
          return entry.getElementsByTagName('RolleRef').map((roleRef) => {
            return {
              id: roleRef.attributes.id,
              title: roleRef.attributes.name,
            };
          });
        });

        if (!responsibleRolesMap.has(rolesInCharge[0].id)) {
          responsibleRolesMap.set(rolesInCharge[0].id, rolesInCharge[0].title);
        }
        if (!responsibleRoleToProductsMap.has(rolesInCharge[0].id)) {
          responsibleRoleToProductsMap.set(rolesInCharge[0].id, []);
        }

        responsibleRoleToProductsMap
          .get(rolesInCharge[0].id)!
          .push({ id: currentProduct.key, title: currentProduct.label });

        // productsToRoles.push({
        //   subheader: rolesInCharge[0].title,
        //   dataEntries: rolesInCharge,
        // });
      }
      // }
    }

    for (const key of responsibleRoleToProductsMap.keys()) {
      const products = responsibleRoleToProductsMap.get(key);
      productsToRoles.push({
        subheader: { id: key, title: responsibleRolesMap.get(key) }, // TODO: id + key
        dataEntries: products,
      });
    }
    return productsToRoles;
  }

  async function getContributeRolesForProducts(productIds: string[]): Promise<any[]> {
    const filterProductDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PRODUCT].includes(item.dataType)
    );

    // TODO: optimieren

    const contributeRoleToProductsMap = new Map<string, { id: string; title: string }[]>();
    const contributeRolesMap = new Map<string, string>();

    const productsToRoles = [];

    for (const productId of productIds) {
      const currentProduct = filterProductDataTypes.filter((product) => product.key === productId)?.[0];

      const contributeRolesForProductsUrl =
        'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Projekttyp/' +
        tailoringProjectTypeId +
        '/Projekttypvariante/' +
        tailoringProjectTypeVariantId +
        '/Disziplin/' +
        currentProduct.parent.key +
        '/Produkt/' +
        currentProduct.key +
        '?' +
        getProjectFeaturesString();

      const jsonDataFromXml: any = await getJsonDataFromXml(contributeRolesForProductsUrl);

      // products.push(jsonDataFromXml.getElementsByTagName('Produkt'));
      //
      // for (const product of products) {
      // const productTitle = currentProduct.label;
      // const productId = product.attributes.id;

      if (productIds.includes(currentProduct.key)) {
        const rolleWirktMitBeiProduktRef: XMLElement[] =
          jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRef');

        // TODO: ist immer nur eine Rolle
        const rolesContributers = rolleWirktMitBeiProduktRef.flatMap((entry) => {
          return entry.getElementsByTagName('RolleRef').map((roleRef) => {
            return {
              id: roleRef.attributes.id,
              title: roleRef.attributes.name,
            };
          });
        });

        if (rolesContributers.length > 0) {
          if (!contributeRolesMap.has(rolesContributers[0].id)) {
            contributeRolesMap.set(rolesContributers[0].id, rolesContributers[0].title);
          }
          if (!contributeRoleToProductsMap.has(rolesContributers[0].id)) {
            contributeRoleToProductsMap.set(rolesContributers[0].id, []);
          }

          contributeRoleToProductsMap
            .get(rolesContributers[0].id)!
            .push({ id: currentProduct.key, title: currentProduct.label });
        }
        // productsToRoles.push({
        //   subheader: rolesInCharge[0].title,
        //   dataEntries: rolesInCharge,
        // });
      }
      // }
    }

    for (const key of contributeRoleToProductsMap.keys()) {
      const products = contributeRoleToProductsMap.get(key);
      productsToRoles.push({
        subheader: { id: key, title: contributeRolesMap.get(key) }, // TODO: id + key
        dataEntries: products,
      });
    }
    return productsToRoles;
  }

  function PageEntryContent() {
    // pageEntryFound = selectedPageEntry;
    // console.log('pageEntryFound', pageEntryFound);

    let productData;

    const productDataArray = [];

    const onChange: TableProps<any>['onChange'] = (pagination, filters, sorter, extra) => {
      console.log('params', pagination, filters, sorter, extra);
    };

    if (selectedPageEntry && selectedPageEntry?.id) {
      productDataArray.push(
        <div key={selectedPageEntry?.id}>
          <h2 id={selectedPageEntry?.id}> {selectedPageEntry?.header} </h2>
          {parse(selectedPageEntry?.descriptionText)}
          <DataTable data={selectedPageEntry?.tableEntries} />

          {selectedPageEntry && selectedPageEntry?.dataSource && (
            <Table
              columns={selectedPageEntry?.columns}
              dataSource={selectedPageEntry?.dataSource}
              pagination={false}
              onChange={onChange}
              scroll={{ y: '60vh' }} // TODO: schauen ob das so erwünscht ist
            />
          )}
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

  function replaceUrlInText(text: string): string {
    return text.replace(
      /src=['"](?:[^"'\/]*\/)*([^'"]+)['"]/g,
      'src="https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Projekttyp/' +
        tailoringProjectTypeId +
        '/Projekttypvariante/' +
        tailoringProjectTypeVariantId +
        '/Grafik/images/$1?' +
        getProjectFeaturesString() +
        '"'
    );
  }

  function fixLinksInText(testString: string): string {
    // setPathSnippets(location.pathname.split('/').filter((i) => i));
    const url = '#/documentation/'; // TODO

    return testString.replace(/href=['"]#(?:[^"'\/]*\/)*([^'"]+)['"]/g, 'href="' + url + '$1' + location.search + '"');
    // return testString.replace(
  }

  async function fetchSectionDetailsData(sectionId: string): Promise<any> {
    const sectionDetailUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Kapitel/' +
      sectionId;

    const jsonDataFromXml: any = await getJsonDataFromXml(sectionDetailUrl);
    const textPart = decodeXml(jsonDataFromXml.children.find((child: any) => child.name === 'Text')?.value);

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.titel,
      generatedContent: jsonDataFromXml.attributes.GenerierterInhalt,
      descriptionText: fixLinksInText(replaceUrlInText(textPart)),
      tableEntries: [],
      subPageEntries: [],
    };
  }

  async function getDisciplineContent(): Promise<PageEntry> {
    const projectTypeUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '?' +
      getProjectFeaturesString();

    return axios.get(projectTypeUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

      const tableEntries: TableEntry[] = [];

      //////////////////////////////////////////////

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: replaceUrlInText(sinnUndZweck),
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
  }

  async function getProductContent(): Promise<PageEntry> {
    const productUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '?' +
      getProjectFeaturesString();

    console.log(productUrl);

    const jsonDataFromXml: any = await getJsonDataFromXml(productUrl);

    let idCounter = 2000;

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
    const rolleVerantwortetProduktRef: XMLElement[] =
      jsonDataFromXml.getElementsByTagName('RolleVerantwortetProduktRef');
    const rolleWirktMitBeiProduktRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('RolleWirktMitBeiProduktRef');
    const produktZuEntscheidungspunktRef: XMLElement[] = jsonDataFromXml.getElementsByTagName(
      'ProduktZuEntscheidungspunktRef'
    );
    const themaZuProduktRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('ThemaZuProduktRef');
    const activitiesRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuProduktRef');
    const externeKopiervorlageZuProduktRef: XMLElement[] = jsonDataFromXml.getElementsByTagName(
      'ExterneKopiervorlageZuProduktRef'
    );
    const erzeugendeAbhaengigkeitzuProduktRef: XMLElement[] = jsonDataFromXml.getElementsByTagName(
      'ErzeugendeAbhängigkeitzuProduktRef'
    );

    const initial = jsonDataFromXml.attributes.Initial;
    const extern = jsonDataFromXml.attributes.Extern;
    const produktvorlage = jsonDataFromXml.attributes.Produktvorlage;

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
        descriptionEntry: 'Mitwirkend',
        dataEntries: rolesTakePart,
      });
    }

    //////////////////////////////////////////////

    const activities: DataEntry[] = activitiesRef.flatMap((entry) => {
      return entry.getElementsByTagName('AktivitätRef').map((activityRef) => {
        return {
          id: activityRef.attributes.id,
          // menuEntryId: activityRef.attributes.id,
          title: activityRef.attributes.name,
          suffix: '(Aktivität)',
        };
      });
    });

    const products: DataEntry[] = externeKopiervorlageZuProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('ExterneKopiervorlageRef').map((productRef) => {
        return {
          id: productRef.attributes.id,
          // menuEntryId: productRef.attributes.id,
          title: productRef.attributes.name,
          suffix: '(Externe Kopiervorlage)',
        };
      });
    });

    /////////////////////////////

    const activitiesData = await getActivitiesData();
    const activitiesToTools = [];

    const relevantActivitiesData = activitiesData.filter((data) =>
      activities.map((activity: DataEntry) => activity.id).includes(data.attributes.id)
    );

    for (const activity of relevantActivitiesData) {
      const toolReferences = activity.getElementsByTagName('WerkzeugreferenzRef');
      for (const toolReference of toolReferences) {
        activitiesToTools.push({
          id: toolReference.attributes.id,
          title: toolReference.attributes.name,
          suffix: '(Werkzeug)',
        });
      }
    }
    /////////////////////////////

    const tools = [...activities, ...products, ...activitiesToTools];
    // console.log('Tools', tools);

    if (tools.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Hilfsmittel',
        dataEntries: tools,
      });
    }

    //////////////////////////////////////////////

    const generatingDependenciesToProduct = erzeugendeAbhaengigkeitzuProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('ErzeugendeAbhängigkeitRef').map((generatingDependencyRef) => {
        return {
          id: generatingDependencyRef.attributes.id,
          title: generatingDependencyRef.attributes.name,
        };
      });
    });

    if (generatingDependenciesToProduct.length > 0) {
      const generatingDependenciesToProductId = generatingDependenciesToProduct[0].id;

      const generatingDependencies = (await getGeneratingDependenciesData()).filter(
        (data) => data.attributes.id === generatingDependenciesToProductId
      );

      const dataEntries = [];

      for (const generatingDependency of generatingDependencies) {
        const generatingDependenciesData = [];

        //////////////
        // get discipline and product for topic
        const filterDisciplineDataTypes = flatten(navigationData).filter((item: any) =>
          [NavTypeEnum.DISCIPLINE].includes(item.dataType)
        );

        const topicsMap = new Map<
          string,
          { discipline: { id: string; title: string }; product: { id: string; title: string } }
        >();

        for (const discipline of filterDisciplineDataTypes) {
          const productsUrl =
            'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
            tailoringModelVariantId +
            '/Projekttyp/' +
            tailoringProjectTypeId +
            '/Projekttypvariante/' +
            tailoringProjectTypeVariantId +
            '/Disziplin/' +
            discipline.key +
            '/Produkt?' +
            getProjectFeaturesString();

          const jsonDataFromXml: any = await getJsonDataFromXml(productsUrl);

          const productEntries: XMLElement[] = jsonDataFromXml.getElementsByTagName('Produkt');

          for (const product of productEntries) {
            const productTopicEntries: XMLElement[] = product.getElementsByTagName('ThemaRef');

            for (const topic of productTopicEntries) {
              topicsMap.set(topic.attributes.id, {
                discipline: { id: discipline.key, title: discipline.label },
                product: { id: product.attributes.id, title: product.attributes.name },
              });
            }
          }
        }

        //////////////

        const topics = generatingDependency.getElementsByTagName('ThemaRef');
        for (const topic of topics) {
          const productsToTopics = [];

          productsToTopics.push({
            id: topicsMap.get(topic.attributes.id)?.product.id,
            title: topicsMap.get(topic.attributes.id)?.product.title,
            suffix: '(' + topic.attributes.name + ')',
          });

          generatingDependenciesData.push({
            subheader: topicsMap.get(topic.attributes.id)?.discipline,
            dataEntries: productsToTopics,
          });
        }
        if (generatingDependenciesData.length > 0) {
          dataEntries.push(generatingDependenciesData);
        }
      }

      if (dataEntries.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Erzeugt durch',
          dataEntries: dataEntries,
        });
      }
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
        descriptionEntry: 'Entscheidungsrelevant bei',
        dataEntries: decisionPoints,
      });
    }

    //////////////////////////////////////////////

    const miscellaneous: string[] = [];

    if (initial === 'Ja') {
      miscellaneous.push('Initial');
    }
    if (extern === 'Ja') {
      miscellaneous.push('Extern');
    }

    if (miscellaneous.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Sonstiges',
        dataEntries: [
          {
            title: miscellaneous.join(', '),
          },
        ],
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
      descriptionText: fixLinksInText(sinnUndZweck),
      tableEntries: tableEntries,
      subPageEntries: subPageEntries,
    };
  }

  ////////////////////////
  ////////////////////////

  function getAnchorItems(): AnchorLinkItemProps[] {
    if (selectedPageEntry) {
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
    } else {
      return [];
    }
  }

  ////////////////////////////////////

  async function getRoleContent(): Promise<PageEntry> {
    const url =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Rolle/' +
      roleId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    return axios.get(url).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);
      const tasksAndAuthorities = jsonDataFromXml.getElementsByTagName('Aufgaben_und_Befugnisse')[0]?.value;
      const skillProfile = jsonDataFromXml.getElementsByTagName('Fähigkeitsprofil')[0]?.value;
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

  async function getProductIndexContent(): Promise<PageEntry> {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PRODUCT].includes(item.dataType)
    );

    let data: any[] = filterRelevantDataTypes.map((navItem: any): any => {
      return {
        modelElement: navItem.label,
        dataTypes: [navItem.dataType],
      };
    });

    /////////////////

    const filterDisciplineDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.DISCIPLINE].includes(item.dataType)
    );

    for (const discipline of filterDisciplineDataTypes) {
      const productsUrl =
        'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Projekttyp/' +
        tailoringProjectTypeId +
        '/Projekttypvariante/' +
        tailoringProjectTypeVariantId +
        '/Disziplin/' +
        discipline.key +
        '/Produkt?' +
        getProjectFeaturesString();

      const jsonDataFromXml: any = await getJsonDataFromXml(productsUrl);

      const themaRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('ThemaRef');
      const productTopicEntries = themaRef.map((subjectRef) => {
        return {
          modelElement: subjectRef.attributes.name,
          dataTypes: [NavTypeEnum.TOPIC],
        };
      });

      data = [...data, ...productTopicEntries];
    }

    /////////////////

    const columns: ColumnsType<any> = [
      {
        title: 'Modellelement',
        dataIndex: 'modelElement',
        key: 'modelElement',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.modelElement, b.modelElement),
        },
        render: (text: string) => <a>{text}</a>, // TODO
      },
      {
        title: 'Typ',
        dataIndex: 'dataTypes',
        key: 'dataTypes',
        filters: [...new Set(data.map((item) => item.dataTypes[0]))].map((item) => ({
          text: t('translation:dataType.' + item),
          value: item,
        })),
        onFilter: (value: string | number | boolean, record: any) => record.dataTypes.indexOf(value) === 0,
        sorter: {
          compare: (a, b) => sorter(a.dataTypes[0], b.dataTypes[0]),
        },
        render: (tags: string[]) => (
          <span>
            {tags?.map((tag) => {
              let color;
              if (tag === 'product') {
                color = 'geekblue';
              }
              if (tag === 'topic') {
                color = 'green';
              }
              return (
                <Tag color={color} key={tag}>
                  {t('translation:dataType.' + tag)}
                </Tag>
              );
            })}
          </span>
        ),
      },
    ];

    return {
      id: 'productIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Produktindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getRoleIndexContent(): Promise<PageEntry> {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PROJECT_TEAM_ROLE, NavTypeEnum.PROJECT_ROLE, NavTypeEnum.ORGANISATION_ROLE].includes(item.dataType)
    );

    const data: any[] = filterRelevantDataTypes.map((navItem: any): any => {
      return {
        modelElement: { id: navItem.key, text: navItem.label },
        dataTypes: [navItem.dataType],
      };
    });

    const columns: ColumnsType<any> = [
      {
        title: 'Modellelement',
        dataIndex: 'modelElement',
        key: 'modelElement',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.modelElement.text, b.modelElement.text),
        },
        render: (object) => <Link to={`/documentation/${object.id}${location.search}`}>{object.text}</Link>, // TODO
      },
      {
        title: 'Typ',
        dataIndex: 'dataTypes',
        key: 'dataTypes',
        filters: [...new Set(data.map((item) => item.dataTypes[0]))].map((item) => ({
          text: t('translation:dataType.' + item),
          value: item,
        })),
        onFilter: (value: string | number | boolean, record: any) => record.dataTypes.indexOf(value) === 0,
        sorter: {
          compare: (a, b) => sorter(a.dataTypes[0], b.dataTypes[0]),
        },
        render: (tags: string[]) => (
          <span>
            {tags?.map((tag) => {
              let color;
              if (tag === 'projectRole') {
                color = 'geekblue';
              }
              if (tag === 'projectTeamRole') {
                color = 'green';
              }
              if (tag === 'organisationRole') {
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {t('translation:dataType.' + tag)}
                </Tag>
              );
            })}
          </span>
        ),
      },
    ];

    return {
      id: 'productIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Produktindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getProcessIndexContent(): Promise<PageEntry> {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PROCESS_MODULE, NavTypeEnum.DECISION_POINT, NavTypeEnum.PROJECT_TYPE_VARIANT_SEQUENCE].includes(
        item.dataType
      )
    );

    const data: any[] = filterRelevantDataTypes.map((navItem: any): any => {
      return {
        modelElement: { id: navItem.key, text: navItem.label },
        dataTypes: [navItem.dataType],
      };
    });

    const columns: ColumnsType<any> = [
      {
        title: 'Modellelement',
        dataIndex: 'modelElement',
        key: 'modelElement',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.modelElement.text, b.modelElement.text),
        },
        render: (object) => <Link to={`/documentation/${object.id}${location.search}`}>{object.text}</Link>, // TODO
      },
      {
        title: 'Typ',
        dataIndex: 'dataTypes',
        key: 'dataTypes',
        filters: [...new Set(data.map((item) => item.dataTypes[0]))].map((item) => ({
          text: t('translation:dataType.' + item),
          value: item,
        })),
        onFilter: (value: string | number | boolean, record: any) => record.dataTypes.indexOf(value) === 0,
        sorter: {
          compare: (a, b) => sorter(a.dataTypes[0], b.dataTypes[0]),
        },
        render: (tags: string[]) => (
          <span>
            {tags?.map((tag) => {
              let color;
              if (tag === 'decisionPoint') {
                color = 'geekblue';
              }
              if (tag === 'processModule') {
                color = 'green';
              }
              if (tag === 'projectTypeVariantSequence') {
                // Projektdurchführungsstrategie
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {t('translation:dataType.' + tag)}
                </Tag>
              );
            })}
          </span>
        ),
      },
    ];

    return {
      id: 'processIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Ablaufindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getTailoringIndexContent(): Promise<PageEntry> {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [
        NavTypeEnum.PROJECT_TYPE_VARIANT,
        NavTypeEnum.PROJECT_TYPE,
        NavTypeEnum.PROJECT_CHARACTERISTIC,
        NavTypeEnum.PROCESS_BUILDING_BLOCK,
      ].includes(item.dataType)
    );

    const data: any[] = filterRelevantDataTypes.map((navItem: any): any => {
      return {
        modelElement: navItem.label,
        dataTypes: [navItem.dataType],
      };
    });

    const columns: ColumnsType<any> = [
      {
        title: 'Modellelement',
        dataIndex: 'modelElement',
        key: 'modelElement',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.modelElement, b.modelElement),
        },
        render: (text: string) => <a>{text}</a>, // TODO
      },
      {
        title: 'Typ',
        dataIndex: 'dataTypes',
        key: 'dataTypes',
        filters: [...new Set(data.map((item) => item.dataTypes[0]))].map((item) => ({
          text: t('translation:dataType.' + item),
          value: item,
        })),
        onFilter: (value: string | number | boolean, record: any) => record.dataTypes.indexOf(value) === 0,
        sorter: {
          compare: (a, b) => sorter(a.dataTypes[0], b.dataTypes[0]),
        },
        render: (tags: string[]) => (
          <span>
            {tags?.map((tag) => {
              let color;
              if (tag === 'projectType') {
                color = 'geekblue';
              }
              if (tag === 'projectTypeVariant') {
                color = 'green';
              }
              if (tag === 'projectCharacteristic') {
                color = 'volcano';
              }
              if (tag === 'processBuildingBlock') {
                color = '';
              }
              return (
                <Tag color={color} key={tag}>
                  {t('translation:dataType.' + tag)}
                </Tag>
              );
            })}
          </span>
        ),
      },
    ];

    return {
      id: 'processIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Tailoringindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getWorkAidsIndexContent(): Promise<PageEntry> {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.ACTIVITY, NavTypeEnum.METHOD_REFERENCE, NavTypeEnum.TOOL_REFERENCE].includes(item.dataType)
    );
    // TODO: fehlt Externe Kopiervorlage, Generierte Produktvorlage

    const data: any[] = filterRelevantDataTypes.map((navItem: any): any => {
      return {
        modelElement: navItem.label,
        dataTypes: [navItem.dataType],
      };
    });

    const columns: ColumnsType<any> = [
      {
        title: 'Modellelement',
        dataIndex: 'modelElement',
        key: 'modelElement',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.modelElement, b.modelElement),
        },
        render: (text: string) => <a>{text}</a>, // TODO
      },
      {
        title: 'Typ',
        dataIndex: 'dataTypes',
        key: 'dataTypes',
        filters: [...new Set(data.map((item) => item.dataTypes[0]))].map((item) => ({
          text: t('translation:dataType.' + item),
          value: item,
        })),
        onFilter: (value: string | number | boolean, record: any) => record.dataTypes.indexOf(value) === 0,
        sorter: {
          compare: (a, b) => sorter(a.dataTypes[0], b.dataTypes[0]),
        },
        render: (tags: string[]) => (
          <span>
            {tags?.map((tag) => {
              let color;
              if (tag === 'activity') {
                color = 'geekblue';
              }
              if (tag === 'methodReference') {
                color = 'green';
              }
              if (tag === 'toolReference') {
                color = 'volcano';
              }
              if (tag === 'Externe Kopiervorlage') {
                color = 'green';
              }
              if (tag === 'Generierte Produktvorlage') {
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {t('translation:dataType.' + tag)}
                </Tag>
              );
            })}
          </span>
        ),
      },
    ];

    return {
      id: 'processIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Arbeitshilfenindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getDecisionPointContent(): Promise<PageEntry> {
    const tailoringProcessBuildingBlocksUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Entscheidungspunkt/' +
      decisionPointId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    const jsonDataFromXml: any = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    // TODO
    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

    const entscheidungspunktZuProduktRef: XMLElement[] = jsonDataFromXml.getElementsByTagName(
      'EntscheidungspunktZuProduktRef'
    );

    const tableEntries: TableEntry[] = [];

    const products = entscheidungspunktZuProduktRef.flatMap((entry) => {
      return entry.getElementsByTagName('ProduktRef').map((productRef) => {
        return {
          id: productRef.attributes.id,
          title: productRef.attributes.name,
        };
      });
    });

    const productsToRoles = await getResponsibleRolesForProducts(products.map((product) => product.id));

    if (productsToRoles.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Zugeordnete Produkte',
        dataEntries: [productsToRoles],
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
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Ablaufbaustein/' +
      processModuleId +
      '?' +
      getProjectFeaturesString();

    // let idCounter = 2000;

    const jsonDataFromXml: any = await getJsonDataFromXml(processModuleUrl);

    console.log('getProcessModuleContent', jsonDataFromXml);

    const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

    const tableEntries: TableEntry[] = [];

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
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Vorgehensbaustein/' +
      processBuildingBlockId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    const jsonDataFromXml: any = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value); // TODO: gibt es das Feld bei Vorgehensbausteinen?

    const tableEntries: TableEntry[] = [];

    const overviewGraphicUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Grafik/images/VB_' +
      processBuildingBlockId +
      '.gif?' +
      getProjectFeaturesString();

    const overviewGraphic = '<p><img src="' + overviewGraphicUrl + '"/></p>';

    const productsRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('Produkt');
    const products = productsRef.map((productRef) => {
      return {
        id: productRef.attributes.id,
        title: productRef.attributes.name,
      };
    });

    const productsToRoles = await getContributeRolesForProducts(products.map((product) => product.id));

    if (productsToRoles.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Mitwirkungen',
        dataEntries: [productsToRoles],
      });
    }

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: sinnUndZweck + overviewGraphic,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  /////

  async function getActivitiesData(): Promise<XMLElement[]> {
    const activitiesUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Aktivitaet?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(activitiesUrl);

    return jsonDataFromXml.getElementsByTagName('Aktivität');
  }

  async function getTemplatesContent(): Promise<PageEntry> {
    console.log('templateDisciplineId', templateDisciplineId);
    const disciplineId = templateDisciplineId?.replace('td_', '');
    // get all products with externalTemplate info for templateDisciplineId

    const productsUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(productsUrl);

    const productEntries = jsonDataFromXml.getElementsByTagName('Produkt');

    let data: any[] = [];

    for (const product of productEntries) {
      const externalTemplateEntries = product.getElementsByTagName('ExterneKopiervorlageRef');
      console.log('externalTemplateEntries', externalTemplateEntries);

      for (const externalTemplateEntry of externalTemplateEntries) {
        // <ExterneKopiervorlageRef id="5f83148a786ca0b" name="Arbeitsauftragsliste"/>

        const externalTemplateUrl =
          'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
          tailoringModelVariantId +
          '/Projekttyp/' +
          tailoringProjectTypeId +
          '/Projekttypvariante/' +
          tailoringProjectTypeVariantId +
          '/ExterneKopiervorlage/' +
          externalTemplateEntry.attributes.id +
          '?' +
          getProjectFeaturesString();

        const jsonDataFromXml: any = await getJsonDataFromXml(externalTemplateUrl);

        const templateId = jsonDataFromXml.attributes.id;
        const templateName = jsonDataFromXml.attributes.name;
        const templateUri = jsonDataFromXml.getElementsByTagName('URI')[0]?.value;

        data = [
          ...data,
          {
            dataTypes: [NavTypeEnum.EXTERNAL_TEMPLATE],
            description: { text: templateName, uri: templateUri },
          },
        ];
      }
    }

    const columns: ColumnsType<any> = [
      {
        title: 'Typ',
        dataIndex: 'dataTypes',
        key: 'dataTypes',
        // filters: [...new Set(data.map((item) => item.dataTypes[0]))].map((item) => ({
        //   text: t('translation:dataType.' + item),
        //   value: item,
        // })),
        onFilter: (value: string | number | boolean, record: any) => record.dataTypes.indexOf(value) === 0,
        sorter: {
          compare: (a, b) => sorter(a.dataTypes[0], b.dataTypes[0]),
        },
        render: (tags: string[]) => (
          <span>
            {tags?.map((tag) => {
              let color;
              if (tag === 'product') {
                color = 'geekblue';
              }
              if (tag === 'topic') {
                color = 'green';
              }
              return (
                <Tag color={color} key={tag}>
                  {t('translation:dataType.' + tag)}
                </Tag>
              );
            })}
          </span>
        ),
      },
      {
        title: 'Beschreibung',
        dataIndex: 'description',
        key: 'description',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.description.text, b.description.text),
        },
        render: (object) => renderCustomCell(object),
      },
    ];

    const renderCustomCell = (object: { text: string; uri: string }) => {
      const { text, uri } = object;
      return (
        <div>
          {text}
          <br />
          <strong>URI: </strong>
          <a>{uri}</a>
        </div>
      );
    };

    return {
      id: 'externalTemplateContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Disziplin', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getMethodReferenceContent(): Promise<PageEntry> {
    const methodReferenceUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Methodenreferenz/' +
      methodReferenceId;

    let idCounter = 2000;

    return axios.get(methodReferenceUrl).then(async (response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
      const quelleRefs: XMLElement[] = jsonDataFromXml.getElementsByTagName('QuelleRefs');

      const tableEntries: TableEntry[] = [];

      //////////////////////////////////////////////

      const activitiesData = await getActivitiesData();
      const activitiesToTools = [];

      for (const activity of activitiesData) {
        const methodReferences = activity.getElementsByTagName('MethodenreferenzRef');
        for (const methodReference of methodReferences) {
          if (methodReference.attributes.id === methodReferenceId) {
            activitiesToTools.push({
              id: activity.attributes.id,
              title: activity.attributes.name,
            });
          }
        }
      }

      if (activitiesToTools.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Aktivitäten',
          dataEntries: activitiesToTools,
        });
      }

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
      tailoringModelVariantId +
      '/Werkzeugreferenz/' +
      toolReferenceId;

    let idCounter = 2000;

    return axios.get(toolReferenceUrl).then(async (response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
      const quelleRefs: XMLElement[] = jsonDataFromXml.getElementsByTagName('QuelleRefs');

      const tableEntries: TableEntry[] = [];

      //////////////////////////////////////////////

      const activitiesData = await getActivitiesData();
      const activitiesToTools = [];

      for (const activity of activitiesData) {
        const toolReferences = activity.getElementsByTagName('WerkzeugreferenzRef');
        for (const toolReference of toolReferences) {
          if (toolReference.attributes.id === toolReferenceId) {
            activitiesToTools.push({
              id: activity.attributes.id,
              title: activity.attributes.name,
            });
          }
        }
      }

      if (activitiesToTools.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Aktivitäten',
          dataEntries: activitiesToTools,
        });
      }

      //////////////////////////////////////////////

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

  async function getProjectCharacteristicContent(): Promise<PageEntry> {
    const projectCharacteristicUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projektmerkmal/' +
      projectCharacteristicId;

    // const jsonDataFromXml: any = await getJsonDataFromXml(methodReferenceUrl);

    const jsonDataFromXml: any = await getJsonDataFromXml(projectCharacteristicUrl);

    // const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

    const question = decodeXml(jsonDataFromXml.getElementsByTagName('Frage')[0]?.value);
    const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);
    const values: XMLElement[] = jsonDataFromXml.getElementsByTagName('Wert');

    const data = [];

    for (const value of values) {
      const valueUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Projektmerkmal/' +
        projectCharacteristicId +
        '/Wert/' +
        value.attributes.id;

      const result: { key: string; answer: string; explanation: string } = await axios
        .get(valueUrl)
        .then((valueResponse) => {
          const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data);
          const valueDescription = decodeXml(valueJsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

          return {
            key: value.attributes.id,
            answer: value.attributes.name,
            explanation: valueDescription,
          };
        });
      data.push(result);
    }

    const tableEntries: TableEntry[] = [];

    //////////////////////////////////////////////

    const columns = [
      {
        title: 'Antwort',
        dataIndex: 'answer',
        key: 'answer',
        // render: (text) => <a>{text}</a>,
      },
      {
        title: 'Erläuterung',
        dataIndex: 'explanation',
        key: 'explanation',
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: html }} />,
      },
    ];

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: description + QUESTION_HEADER + question,
      tableEntries: tableEntries,
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
    // });
  }

  async function getAbbreviationsContent(): Promise<PageEntry> {
    const abbreviationsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Abkuerzung/';

    const jsonDataFromXml: any = await getJsonDataFromXml(abbreviationsUrl);

    const abbreviations: XMLElement[] = jsonDataFromXml.getElementsByTagName('Abkuerzung');

    const data = [];

    for (const abbreviation of abbreviations) {
      const abbreviationUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Abkuerzung/' +
        abbreviation.attributes.id;

      const result: { key: string; abbreviation: string; expression: string } = await axios
        .get(abbreviationUrl)
        .then((valueResponse) => {
          const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data);
          const valueDescription = decodeXml(valueJsonDataFromXml.getElementsByTagName('Begriff')[0]?.value);

          return {
            key: abbreviation.attributes.id,
            abbreviation: abbreviation.attributes.name,
            expression: valueDescription,
          };
        });
      data.push(result);
    }

    const tableEntries: TableEntry[] = [];
    //
    // //////////////////////////////////////////////
    //
    const columns = [
      {
        title: 'Kürzel',
        dataIndex: 'abbreviation',
        key: 'abbreviation',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.abbreviation, b.abbreviation),
        },
        width: '150px',
      },
      {
        title: 'Begriff',
        dataIndex: 'expression',
        key: 'expression',
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: html }} />,
      },
    ];

    return {
      id: 'abbreviationsContent',
      header: 'Abkürzungen', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: tableEntries,
      dataSource: data,
      columns: columns,
    };
  }

  async function getGlossaryContent(): Promise<PageEntry> {
    const expressionsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Begriff/';

    const jsonDataFromXml: any = await getJsonDataFromXml(expressionsUrl);

    const expressions: XMLElement[] = jsonDataFromXml.getElementsByTagName('Begriff');

    const data = [];

    for (const expression of expressions) {
      const expressionUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Begriff/' +
        expression.attributes.id;

      const result: { key: string; expression: string; explanation: string } = await axios
        .get(expressionUrl)
        .then((valueResponse) => {
          const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data);
          const valueDescription = decodeXml(valueJsonDataFromXml.getElementsByTagName('Erläuterung')[0]?.value);

          return {
            key: expression.attributes.id,
            expression: expression.attributes.name,
            explanation: valueDescription,
          };
        });
      data.push(result);
    }

    const tableEntries: TableEntry[] = [];
    //
    // //////////////////////////////////////////////
    //
    const columns = [
      {
        title: 'Begriff',
        dataIndex: 'expression',
        key: 'expression',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.expression, b.expression),
        },
        width: '250px',
      },
      {
        title: 'Erläuterung',
        dataIndex: 'explanation',
        key: 'explanation',
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: html }} />,
      },
    ];

    return {
      id: 'glossaryContent',
      header: 'Glossar', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: tableEntries,
      dataSource: data,
      columns: columns,
    };
  }

  async function getLiteratureContent(): Promise<PageEntry> {
    const sourcesUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Quelle/';

    const jsonDataFromXml: any = await getJsonDataFromXml(sourcesUrl);

    const sources: XMLElement[] = jsonDataFromXml.getElementsByTagName('Quelle');

    const data = [];

    for (const source of sources) {
      const sourceUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringModelVariantId +
        '/Quelle/' +
        source.attributes.id;

      const result: { key: string; abbreviation: string; reference: string } = await axios
        .get(sourceUrl)
        .then((valueResponse) => {
          const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data);
          const valueDescription = decodeXml(valueJsonDataFromXml.getElementsByTagName('Quellenverweis')[0]?.value);

          return {
            key: source.attributes.id,
            abbreviation: source.attributes.name,
            reference: valueDescription,
          };
        });
      data.push(result);
    }

    const tableEntries: TableEntry[] = [];
    //
    // //////////////////////////////////////////////
    //
    const columns = [
      {
        title: 'Kürzel',
        dataIndex: 'abbreviation',
        key: 'abbreviation',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.abbreviation, b.abbreviation),
        },
        width: '150px',
      },
      {
        title: 'Quellenverweis',
        dataIndex: 'reference',
        key: 'reference',
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: html }} />,
      },
    ];

    return {
      id: 'literatureContent',
      header: 'Literaturverzeichnis', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: tableEntries,
      dataSource: data,
      columns: columns,
    };
  }

  async function getProjectTypeContent(): Promise<PageEntry> {
    const projectTypeUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      projectTypeId;

    return axios.get(projectTypeUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

      const tableEntries: TableEntry[] = [];

      //////////////////////////////////////////////

      return {
        id: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: description,
        tableEntries: tableEntries,
      };
    });
  }

  async function getProjectTypeVariantContent(): Promise<PageEntry> {
    const projectTypeVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    // const jsonDataFromXml: any = await getJsonDataFromXml(methodReferenceUrl);

    return axios.get(projectTypeVariantUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      // const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
      const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

      const tableEntries: TableEntry[] = [];

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

  async function getProjectTypeVariantSequenceContent(): Promise<PageEntry> {
    const projectTypeVariantId = projectTypeVariantSequenceId?.replace('pes_', '');

    const projectTypeVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    // const jsonDataFromXml: any = await getJsonDataFromXml(methodReferenceUrl);

    return axios.get(projectTypeVariantUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      let idCounter = 2000;

      const sequence = decodeXml(jsonDataFromXml.getElementsByTagName('Ablauf')[0]?.value);
      const ablaufbausteinRefs: XMLElement[] = jsonDataFromXml.getElementsByTagName('AblaufbausteinRef');

      const ablaufbausteine = ablaufbausteinRefs.map((ablaufbausteinRef) => {
        return {
          id: ablaufbausteinRef.attributes.id,
          title: ablaufbausteinRef.attributes.name,
        };
      });

      const tableEntries: TableEntry[] = [];

      if (ablaufbausteine.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Ablaufbausteine',
          dataEntries: ablaufbausteine,
        });
      }

      // AblaufbausteinRef;

      //////////////////////////////////////////////

      // console.log('this.pageEntry roles', this.pageEntry);

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: replaceUrlInText(sequence),
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
  }

  async function getActivityContent(): Promise<PageEntry> {
    const workAidsActivityUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringModelVariantId +
      '/Projekttyp/' +
      tailoringProjectTypeId +
      '/Projekttypvariante/' +
      tailoringProjectTypeVariantId +
      '/Aktivitaet/' +
      activityId +
      '?' +
      getProjectFeaturesString();

    // const jsonDataFromXml: any = await getJsonDataFromXml(methodReferenceUrl);

    return axios.get(workAidsActivityUrl).then((response) => {
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      let idCounter = 2000;

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
      const aktivityRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuProduktRef');
      const methodsRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuMethodenreferenzRef');
      const toolsRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuWerkzeugreferenzRef');
      // const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

      const tableEntries: TableEntry[] = [];

      //////////////////////////////////////////////

      const products = aktivityRef.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            // menuEntryId: activityRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Produkt',
        dataEntries: products,
      });

      const tools = toolsRef.flatMap((entry) => {
        return entry.getElementsByTagName('WerkzeugreferenzRef').map((toolRef) => {
          return {
            id: toolRef.attributes.id,
            // menuEntryId: activityRef.attributes.id,
            title: toolRef.attributes.name,
          };
        });
      });

      if (tools.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Werkzeuge',
          dataEntries: tools,
        });
      }

      const methods = methodsRef.flatMap((entry) => {
        return entry.getElementsByTagName('MethodenreferenzRef').map((methodRef) => {
          return {
            id: methodRef.attributes.id,
            // menuEntryId: activityRef.attributes.id,
            title: methodRef.attributes.name,
          };
        });
      });

      if (methods.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Methoden',
          dataEntries: methods,
        });
      }

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
      <Spin spinning={loading}>
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
      </Spin>
    </>
  );
}
