// import 'antd/dist/antd.css';
import parse, { domToReact } from 'html-react-parser';

import { Anchor, Col, FloatButton, Layout, Row, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
// import { DataEntry, PageEntry, TableEntry } from '@dipa-projekt/projektassistent-openapi';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentation } from '../../../../context/DocumentationContext';
import {
  decodeXml,
  fixLinksInText,
  flatten,
  getFigureDesignationFromText,
  getJsonDataFromXml,
  getMenuItemByAttributeValue,
  getSearchStringFromHash,
  replaceImageUrlInText,
  replaceUrlInText,
} from '../../../../shares/utils';
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { IndexTypeEnum, NavMenuItem, NavTypeEnum } from '../navigation/Navigation';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useTailoring } from '../../../../context/TailoringContext';
import { PageEntryContent } from './PageEntryContent';
import { weitApiUrl } from '../../../app/App';
import { HashLink } from 'react-router-hash-link';
import { DataEntry, PageEntry, TableEntry } from '../Documentation';
import { ProjectType } from '../../projekt/project';

function getConceptMappingData(conceptMapping: XMLElement, tagName: string, suffix: string): DataEntry[] {
  return conceptMapping.getElementsByTagName(tagName).map((data: XMLElement) => {
    const dataEntry: DataEntry = {
      id: tagName !== 'wird_abgebildet_durchThemaRef' ? data.attributes.id : undefined,
      title: data.attributes?.name || data.attributes?.titel,
      suffix: suffix,
    };
    return dataEntry;
  });
}

export function Content() {
  const [loading, setLoading] = useState(false);

  const { tailoringParameter, getProjectFeaturesQueryString: getProjectFeaturesString } = useTailoring();

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
    contentProductDependencyId,
    roleId,
    decisionPointId,
    conventionFigureId,
    divisionId,
    methodReferenceId,
    toolReferenceId,
    processBuildingBlockId,
    projectCharacteristicId,
    projectTypeId,
    projectTypeVariantId,
    projectTypeVariantSequenceId,
    activityId,
    templateDisciplineId,
    productDisciplineId,
    glossaryEntryId,
    entryId,
    selectedIndexType,
    setSelectedItemKey,
  } = useDocumentation();

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedPageEntry?.subPageEntries) {
      console.log('selectedPageEntry?.subPageEntries set');
    }
    //eslint-disable-next-line
  }, [selectedPageEntry?.subPageEntries]);

  useEffect(() => {
    async function mount() {
      if (productId && productDisciplineId) {
        const content = await getProductContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [productId]);

  useEffect(() => {
    // redirect only if discipline was selected directly
    if (productDisciplineId && !productId) {
      redirectToFirstChildWithContent(productDisciplineId);
    }

    //eslint-disable-next-line
  }, [productDisciplineId]);

  useEffect(() => {
    async function mount() {
      if (disciplineId) {
        const content = await getDisciplineContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [disciplineId]);

  useEffect(() => {
    async function mount() {
      if (contentProductDependencyId) {
        const content = await getContentProductDependencyContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [contentProductDependencyId]);

  useEffect(() => {
    async function mount() {
      // TODO: noch schauen wo das genau hinkommt
      if (selectedIndexType) {
        let content;
        switch (selectedIndexType) {
          case IndexTypeEnum.PRODUCT:
            content = getProductIndexContent();
            break;
          case IndexTypeEnum.ROLE:
            content = getRoleIndexContent();
            break;
          case IndexTypeEnum.PROCESS:
            content = getProcessIndexContent();
            break;
          case IndexTypeEnum.TAILORING:
            content = getTailoringIndexContent();
            break;
          case IndexTypeEnum.WORK_AIDS:
            content = getWorkAidsIndexContent();
            break;
          case IndexTypeEnum.OTHER_STANDARDS:
            content = getOtherStandardsIndexContent();
            break;
        }
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [selectedIndexType]);

  useEffect(() => {
    async function mount() {
      if (roleId) {
        const content = await getRoleContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [roleId]);

  useEffect(() => {
    async function mount() {
      if (processBuildingBlockId) {
        const content = await getTailoringProcessBuildingBlocksContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [processBuildingBlockId]);

  useEffect(() => {
    async function mount() {
      if (decisionPointId) {
        const content = await getDecisionPointContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [decisionPointId]);

  useEffect(() => {
    async function mount() {
      if (conventionFigureId) {
        const content = await getConventionFigureContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [conventionFigureId]);

  useEffect(() => {
    async function mount() {
      if (divisionId) {
        const content = await getDivisionContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [divisionId]);

  useEffect(() => {
    async function mount() {
      if (methodReferenceId) {
        const content = await getMethodReferenceContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [methodReferenceId]);

  useEffect(() => {
    async function mount() {
      if (toolReferenceId) {
        const content = await getToolReferenceContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [toolReferenceId]);

  useEffect(() => {
    async function mount() {
      if (projectCharacteristicId) {
        const content = await getProjectCharacteristicContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [projectCharacteristicId]);

  useEffect(() => {
    async function mount() {
      if (projectTypeId) {
        const content = await getProjectTypeContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [projectTypeId]);

  useEffect(() => {
    async function mount() {
      if (projectTypeVariantId) {
        const content = await getProjectTypeVariantContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [projectTypeVariantId]);

  useEffect(() => {
    async function mount() {
      if (projectTypeVariantSequenceId) {
        const content = await getProjectTypeVariantSequenceContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [projectTypeVariantSequenceId]);

  useEffect(() => {
    async function mount() {
      if (activityId) {
        const content = await getActivityContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [activityId]);

  useEffect(() => {
    async function mount() {
      if (templateDisciplineId) {
        const content = await getTemplatesContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [templateDisciplineId]);

  useEffect(() => {
    async function mount() {
      if (glossaryEntryId) {
        const content = await getGlossaryEntryContent();
        setSelectedPageEntry(content);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [glossaryEntryId]);

  useEffect(() => {
    async function mount() {
      if (entryId) {
        setLoading(true);
        const content = await fetchSectionDetailsData(entryId);

        if (content.generatedContent === 'Elemente:Abkürzungen') {
          const content2 = await getAbbreviationsContent();
          setSelectedPageEntry(content2);
        } else if (content.generatedContent === 'Elemente:Glossar') {
          const content2 = await getGlossaryContent();
          setSelectedPageEntry(content2);
        } else if (content.generatedContent === 'Elemente:Quellen') {
          const content2 = await getLiteratureContent();
          setSelectedPageEntry(content2);
        } else {
          setSelectedPageEntry(content);
        }
        setLoading(false);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [entryId]);

  async function getResponsibleRolesForProducts(productIds: string[]): Promise<any[]> {
    const filterProductDataTypes: NavMenuItem[] = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PRODUCT].includes(item.dataType)
    );

    // TODO: optimieren

    const responsibleRoleToProductsMap = new Map<string, { id: string; title: string }[]>();
    const responsibleRolesMap = new Map<string, string>();

    const productsToRoles = [];

    for (const productId of productIds) {
      const currentProduct = filterProductDataTypes.filter((product) => product.key === productId)?.[0];

      const productDiscipline = currentProduct.parent.key;
      const disciplineId = productDiscipline?.replace('productDiscipline_', '');

      const responsibleRolesForProductsUrl =
        weitApiUrl +
        '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
        '/Projekttyp/' +
        tailoringParameter.projectTypeId +
        '/Projekttypvariante/' +
        tailoringParameter.projectTypeVariantId +
        '/Disziplin/' +
        disciplineId +
        '/Produkt/' +
        currentProduct.key +
        '?' +
        getProjectFeaturesString();

      const jsonDataFromXml = await getJsonDataFromXml(responsibleRolesForProductsUrl);

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
        subheader: { id: key, title: responsibleRolesMap.get(key), isLink: true }, // TODO: id + key
        dataEntries: products,
      });
    }
    return productsToRoles;
  }

  async function getContributeRolesForProducts(productIds: string[]): Promise<any[]> {
    const filterProductDataTypes: NavMenuItem[] = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PRODUCT].includes(item.dataType)
    );

    // TODO: optimieren

    const contributeRoleToProductsMap = new Map<string, { id: string; title: string }[]>();
    const contributeRolesMap = new Map<string, string>();

    const productsToRoles = [];

    for (const productId of productIds) {
      const currentProduct = filterProductDataTypes.filter((product) => product.key === productId)?.[0];

      const productDiscipline = currentProduct.parent.key;
      const disciplineId = productDiscipline?.replace('productDiscipline_', '');

      const contributeRolesForProductsUrl =
        weitApiUrl +
        '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
        '/Projekttyp/' +
        tailoringParameter.projectTypeId +
        '/Projekttypvariante/' +
        tailoringParameter.projectTypeVariantId +
        '/Disziplin/' +
        disciplineId +
        '/Produkt/' +
        currentProduct.key +
        '?' +
        getProjectFeaturesString();

      const jsonDataFromXml = await getJsonDataFromXml(contributeRolesForProductsUrl);

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
        subheader: { id: key, title: contributeRolesMap.get(key), isLink: true }, // TODO: id + key
        dataEntries: products,
      });
    }
    return productsToRoles;
  }

  async function fetchSectionDetailsData(sectionId: string): Promise<any> {
    const sectionDetailUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Kapitel/' +
      sectionId;

    const jsonDataFromXml = await getJsonDataFromXml(sectionDetailUrl);

    let textPart = '';
    if (jsonDataFromXml.children) {
      const childText = jsonDataFromXml.children.find((child) => child.name === 'Text');
      if (childText) {
        textPart = decodeXml(childText.value);
      } else if (jsonDataFromXml.children.length > 0) {
        // redirect to first child with content
        redirectToFirstChildWithContent(sectionId);
      } else {
        textPart = t('text.pleaseSelectSubChapter');
      }
    }

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.titel,
      generatedContent: jsonDataFromXml.attributes.GenerierterInhalt,
      descriptionText: replaceUrlInText(textPart, tailoringParameter, getProjectFeaturesString()),
      tableEntries: [],
      subPageEntries: [],
    };
  }

  async function getDisciplineContent(): Promise<PageEntry> {
    const projectTypeUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeUrl);

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

    const tableEntries: TableEntry[] = [];

    const products = jsonDataFromXml.getElementsByTagName('Produkt').map((productRef) => {
      return {
        id: productRef.attributes.id,
        title: productRef.attributes.name,
      };
    });

    const productsToRoles = await getResponsibleRolesForProducts(products.map((product) => product.id));

    if (productsToRoles.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Verantwortliche und Produkte',
        dataEntries: [productsToRoles],
      });
    }
    //////////////////////////////////////////////

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: replaceUrlInText(sinnUndZweck, tailoringParameter, getProjectFeaturesString()),
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  // TODO: wird auch in SubEntries benötigt
  async function getGeneratingDependenciesData(): Promise<XMLElement[]> {
    const generatingDependenciesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/ErzeugendeAbhaengigkeit?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(generatingDependenciesUrl);

    return jsonDataFromXml.getElementsByTagName('ErzeugendeAbhängigkeit');
  }

  async function getProductContent(): Promise<PageEntry> {
    const disciplineId = productDisciplineId?.replace('productDiscipline_', '');

    const productUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt/' +
      productId +
      '?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(productUrl);

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
    const inhaltlicheAbhaengigkeitenGruppeRef: XMLElement[] = jsonDataFromXml.getElementsByTagName(
      'InhaltlicheAbhängigkeitenGruppeRef'
    );

    const initial = jsonDataFromXml.attributes.Initial;
    const extern = jsonDataFromXml.attributes.Extern;
    // const produktvorlage = jsonDataFromXml.attributes.Produktvorlage;

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

    // To hide the links to the activities in the tools section of a product the id has to removed here
    const activitiesWithoutId = activities.map(({ id, ...keepAttrs }) => keepAttrs);

    const tools = [...activitiesWithoutId, ...products, ...activitiesToTools];

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
            weitApiUrl +
            '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
            tailoringParameter.modelVariantId +
            '/Projekttyp/' +
            tailoringParameter.projectTypeId +
            '/Projekttypvariante/' +
            tailoringParameter.projectTypeVariantId +
            '/Disziplin/' +
            discipline.key +
            '/Produkt?' +
            getProjectFeaturesString();

          const jsonDataFromXml = await getJsonDataFromXml(productsUrl);

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

          const topicsMapEntry = topicsMap.get(topic.attributes.id);
          if (topicsMapEntry) {
            productsToTopics.push({
              id: topicsMapEntry.product.id,
              title: topicsMapEntry.product.title,
              suffix: '(' + topic.attributes.name + ')',
            });

            generatingDependenciesData.push({
              subheader: { ...topicsMapEntry.discipline, isLink: true },
              dataEntries: productsToTopics,
            });
          } else {
            console.log('topic nicht in product liste!!!', topic); // TODO: darf das vorkommen?
          }
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

    const contentDependenciesDataEntries = await getProductsForContentDependencies(
      inhaltlicheAbhaengigkeitenGruppeRef,
      productId as string
    );

    if (contentDependenciesDataEntries.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: 'Inhaltlich abhängig',
        dataEntries: contentDependenciesDataEntries,
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
      descriptionText: sinnUndZweck,
      tableEntries: tableEntries,
      subPageEntries: subPageEntries,
    };
  }

  async function getProductsForContentDependencies(
    inhaltlicheAbhaengigkeitenGruppeRef: XMLElement[],
    productId: string
  ): Promise<any> {
    const contentProductDependenciesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/InhaltlicheAbhaengigkeitenGruppe?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(contentProductDependenciesUrl);

    const result = [];

    for (const inhaltlicheAbhaengigkeitenGruppe of inhaltlicheAbhaengigkeitenGruppeRef) {
      const inhaltlicheAbhaengigkeitenGruppeId = inhaltlicheAbhaengigkeitenGruppe.attributes.id;

      const data = [];

      // alle InhaltlicheAbhängigkeitenGruppen
      const allContentDependenciesGroups: XMLElement[] = jsonDataFromXml.getElementsByTagName(
        'InhaltlicheAbhängigkeitenGruppe'
      );
      // aktuell zum ausgewählten Projekt zugehörige InhaltlicheAbhängigkeitenGruppe
      const selectedContentDependenciesGroup = allContentDependenciesGroups.filter(
        (group: XMLElement) => group.attributes.id === inhaltlicheAbhaengigkeitenGruppeId
      )[0];

      const contentDependenciesToContentDependenciesGroupsMap = new Map<
        string,
        { id: string; title: string; products: { id: string; title: string }[] }[]
      >();

      for (const contentDependenciesGroup of allContentDependenciesGroups) {
        const contentDependencyProducts = contentDependenciesGroup
          .getElementsByTagName('ProduktRef')
          .map((productRef) => {
            return {
              id: productRef.attributes.id,
              title: productRef.attributes.name,
            };
          });

        const contentDependencies = contentDependenciesGroup.getElementsByTagName('InhaltlicheAbhängigkeit');
        for (const contentDependency of contentDependencies) {
          if (!contentDependenciesToContentDependenciesGroupsMap.has(contentDependency.attributes.id)) {
            contentDependenciesToContentDependenciesGroupsMap.set(contentDependency.attributes.id, []);
          }

          contentDependenciesToContentDependenciesGroupsMap.get(contentDependency.attributes.id)!.push({
            id: contentDependenciesGroup.attributes.id,
            title: contentDependenciesGroup.attributes.name,
            products: contentDependencyProducts,
          });
        }
      }

      let filteredGroupWithoutProduct;

      const contentDependenciesOfSelectedGroup =
        selectedContentDependenciesGroup.getElementsByTagName('InhaltlicheAbhängigkeit');
      for (const contentDependencyOfSelectedGroup of contentDependenciesOfSelectedGroup) {
        const associatedContentDependenciesGroups = contentDependenciesToContentDependenciesGroupsMap.get(
          contentDependencyOfSelectedGroup.attributes.id
        );

        if (associatedContentDependenciesGroups) {
          filteredGroupWithoutProduct = associatedContentDependenciesGroups.filter(
            (content) => !content.products.map((products) => products.id).includes(productId)
          )[0];
        }

        /////////////////

        const dataEntries = [];

        if (filteredGroupWithoutProduct) {
          for (const product of filteredGroupWithoutProduct.products) {
            dataEntries.push({
              id: product.id,
              title: product.title,
            });
          }
        }

        ////////////////////
        data.push({
          subheader: {
            id: contentDependencyOfSelectedGroup.attributes.id,
            title: contentDependencyOfSelectedGroup.attributes.name,
            isLink: true,
          },
          dataEntries: dataEntries,
        });
      }

      result.push(data);
    }

    return result;
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
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Rolle/' +
      roleId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    const jsonDataFromXml = await getJsonDataFromXml(url);

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

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: description,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  function getProductIndexContent(): PageEntry {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.PRODUCT].includes(item.dataType)
    );

    const data: any[] = filterRelevantDataTypes.map((navItem: any): any => {
      return {
        modelElement: {
          id: navItem.key,
          text: navItem.label,
        },
        dataTypes: [navItem.dataType],
      };
    });

    /////////////////

    const columns: ColumnsType<any> = [
      {
        title: 'Modellelement',
        dataIndex: 'modelElement',
        key: 'modelElement',
        defaultSortOrder: 'ascend',
        sorter: {
          compare: (a, b) => sorter(a.modelElement.text, b.modelElement.text),
        },
        render: (object) => <Link to={`/documentation/${object.id}${getSearchStringFromHash()}`}>{object.text}</Link>, // TODO  HashLink
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

  function getRoleIndexContent(): PageEntry {
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
        render: (object) => <Link to={`/documentation/${object.id}${getSearchStringFromHash()}`}>{object.text}</Link>, // TODO
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
      id: 'roleIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Rollentindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  function getProcessIndexContent(): PageEntry {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.DECISION_POINT, NavTypeEnum.PROJECT_TYPE_VARIANT_SEQUENCE].includes(item.dataType)
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
        render: (object) => <Link to={`/documentation/${object.id}${getSearchStringFromHash()}`}>{object.text}</Link>, // TODO
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

  function getTailoringIndexContent(): PageEntry {
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
        render: (object) => <Link to={`/documentation/${object.id}${getSearchStringFromHash()}`}>{object.text}</Link>,
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
      id: 'tailoringIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Tailoringindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  function getWorkAidsIndexContent(): PageEntry {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.ACTIVITY, NavTypeEnum.METHOD_REFERENCE, NavTypeEnum.TOOL_REFERENCE].includes(item.dataType)
    );
    // TODO: fehlt Externe Kopiervorlage, Generierte Produktvorlage

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
        render: (object) => <Link to={`/documentation/${object.id}${getSearchStringFromHash()}`}>{object.text}</Link>,
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
      id: 'workAidsIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Arbeitshilfenindex', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  function getOtherStandardsIndexContent(): PageEntry {
    const filterRelevantDataTypes = flatten(navigationData).filter((item: any) =>
      [NavTypeEnum.CONVENTION_FIGURE, NavTypeEnum.DIVISION].includes(item.dataType)
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
        render: (object) => <Link to={`/documentation/${object.id}${getSearchStringFromHash()}`}>{object.text}</Link>,
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
              if (tag === 'conventionFigure') {
                color = 'geekblue';
              }
              if (tag === 'division') {
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
      id: 'otherStandardsIndexContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: 'Andere-Standards-Index', //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
    };
  }

  async function getDecisionPointContent(): Promise<PageEntry> {
    const tailoringProcessBuildingBlocksUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Entscheidungspunkt/' +
      decisionPointId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    const jsonDataFromXml = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

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

  async function getConventionFigureContent(): Promise<PageEntry> {
    const conventionFigureUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Konventionsabbildung/' +
      conventionFigureId;

    const jsonDataFromXml = await getJsonDataFromXml(conventionFigureUrl);

    const summary = decodeXml(jsonDataFromXml.getElementsByTagName('Zusammenfassung')[0]?.value);

    const tableEntries: TableEntry[] = [];

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: replaceImageUrlInText(summary, tailoringParameter),
      tableEntries: tableEntries,
    };
  }

  async function getDivisionContent(): Promise<PageEntry> {
    if (divisionId) {
      const foundDivision = getMenuItemByAttributeValue(navigationData, 'key', divisionId);

      const conventionFigureId = foundDivision?.parent?.key;

      const conventionFigureUrl =
        weitApiUrl +
        '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
        '/Konventionsabbildung/' +
        conventionFigureId;

      let idCounter = 2000;

      const jsonDataFromXml = await getJsonDataFromXml(conventionFigureUrl);

      const divisionData = jsonDataFromXml
        .getElementsByTagName('Bereich')
        .find((division) => division.attributes.id === divisionId);

      if (!divisionData) {
        return null;
      }

      const explanation = decodeXml(divisionData.getElementsByTagName('Erläuterung')[0]?.value);
      const conceptMappings = divisionData.getElementsByTagName('Begriffsabbildung');

      const tableEntries: TableEntry[] = [];

      conceptMappings.forEach((conceptMapping) => {
        const conceptMappingName = conceptMapping.attributes.name;

        const description = decodeXml(conceptMapping.getElementsByTagName('Beschreibung')[0]?.value);

        let dataEntries: DataEntry[] = [];

        const wird_abgebildet_durchKapitelRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchKapitelRef',
          '(Kapitel)'
        );
        const wird_abgebildet_durchVBRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchVBRef',
          '(Vorgehensbaustein)'
        );
        const wird_abgebildet_durchPTVRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchPTVRef',
          '(Projekttypvariante)'
        );
        const wird_abgebildet_durchRolleRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchRolleRef',
          '(Rolle)'
        );
        const wird_abgebildet_durchAktivitaetRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchAktivitätRef',
          '(Aktivität)'
        );
        const wird_abgebildet_durchDisziplinRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchDisziplinRef',
          '(Disziplin)'
        );
        const wird_abgebildet_durchProduktRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchProduktRef',
          '(Produkt)'
        );

        // TODO: Hier gibt's noch Probleme bei der Verlinkung, weil Themen keine eigene Seite haben, sondern nur auf
        // Produkten angezeigt werden.
        const wird_abgebildet_durchThemaRefs = getConceptMappingData(
          conceptMapping,
          'wird_abgebildet_durchThemaRef',
          '(Thema)'
        );

        dataEntries = [
          ...dataEntries,
          ...wird_abgebildet_durchKapitelRefs,
          ...wird_abgebildet_durchVBRefs,
          ...wird_abgebildet_durchPTVRefs,
          ...wird_abgebildet_durchRolleRefs,
          ...wird_abgebildet_durchAktivitaetRefs,
          ...wird_abgebildet_durchDisziplinRefs,
          ...wird_abgebildet_durchProduktRefs,
          ...wird_abgebildet_durchThemaRefs,
        ];

        const isRepresentedByData = [];

        if (dataEntries.length > 0) {
          isRepresentedByData.push([
            {
              subheader: {
                id: idCounter + '_isRepresentedBy',
                title: 'Wird erfüllt durch:',
                isLink: false,
              },
              dataEntryDescription: description,
              dataEntries: dataEntries,
            },
          ]);
        }

        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: conceptMappingName,
          dataEntries: isRepresentedByData,
        });
      });

      return {
        id: divisionData.attributes.id,
        header: decodeXml(divisionData.attributes.name),
        descriptionText: explanation,
        tableEntries: tableEntries,
      };
    }
  }

  async function getContentProductDependencyContent(): Promise<PageEntry> {
    const contentProductDependenciesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/InhaltlicheAbhaengigkeitenGruppe?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(contentProductDependenciesUrl);

    let idCounter = 1;

    const contentProductDependencyGroups = jsonDataFromXml.getElementsByTagName('InhaltlicheAbhängigkeitenGruppe');

    let header;
    let description;

    const tableEntries = [];

    for (const contentProductDependencyGroup of contentProductDependencyGroups) {
      const contentProductDependencies = contentProductDependencyGroup.getElementsByTagName('InhaltlicheAbhängigkeit');

      const dataEntries = [];

      for (const contentProductDependency of contentProductDependencies) {
        if (contentProductDependency.attributes.id === contentProductDependencyId) {
          description = decodeXml(contentProductDependency.getElementsByTagName('Beschreibung')[0]?.value);

          const products = contentProductDependencyGroup.getElementsByTagName('ProduktRef');

          for (const product of products) {
            dataEntries.push({
              id: product.attributes.id,
              title: product.attributes.name,
            });
          }

          if (dataEntries.length > 0) {
            tableEntries.push({
              id: idCounter.toString(),
              descriptionEntry:
                (dataEntries.length > 1 ? t('translation:label.products') : t('translation:label.product')) +
                ' (' +
                t('translation:label.group') +
                idCounter +
                ')',
              dataEntries: dataEntries,
            });
            idCounter++;
          }

          header = contentProductDependency.attributes.name;
        }
      }
    }

    return {
      id: contentProductDependencyId as string,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: header,
      descriptionText: description as string,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  async function getTailoringProcessBuildingBlocksContent(): Promise<PageEntry> {
    const tailoringProcessBuildingBlocksUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Vorgehensbaustein/' +
      processBuildingBlockId +
      '?' +
      getProjectFeaturesString();

    let idCounter = 2000;

    const jsonDataFromXml = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value); // TODO: gibt es das Feld bei Vorgehensbausteinen?

    const tableEntries: TableEntry[] = [];

    const overviewGraphicUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
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
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Aktivitaet?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(activitiesUrl);

    return jsonDataFromXml.getElementsByTagName('Aktivität');
  }

  async function getGlossaryEntryContent(): Promise<XMLElement[]> {
    const expressionUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Begriff/' +
      glossaryEntryId;

    const jsonDataFromXml = await getJsonDataFromXml(expressionUrl);

    const description = decodeXml(jsonDataFromXml.getElementsByTagName('Erläuterung')[0]?.value);

    const tableEntries: TableEntry[] = [];

    //////////////////////////////////////////////

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: description,
      tableEntries: tableEntries,
    };
  }

  async function getTemplatesContent(): Promise<PageEntry> {
    const disciplineId = templateDisciplineId?.replace('td_', '');
    // get all products with externalTemplate info for templateDisciplineId

    const productsUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin/' +
      disciplineId +
      '/Produkt?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(productsUrl);

    const productEntries = jsonDataFromXml.getElementsByTagName('Produkt');

    let data: any[] = [];

    for (const product of productEntries) {
      const externalTemplateEntries = product.getElementsByTagName('ExterneKopiervorlageRef');

      for (const externalTemplateEntry of externalTemplateEntries) {
        // <ExterneKopiervorlageRef id="5f83148a786ca0b" name="Arbeitsauftragsliste"/>

        const externalTemplateUrl =
          weitApiUrl +
          '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
          tailoringParameter.modelVariantId +
          '/Projekttyp/' +
          tailoringParameter.projectTypeId +
          '/Projekttypvariante/' +
          tailoringParameter.projectTypeVariantId +
          '/ExterneKopiervorlage/' +
          externalTemplateEntry.attributes.id +
          '?' +
          getProjectFeaturesString();

        const jsonDataFromXml = await getJsonDataFromXml(externalTemplateUrl);

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

    const disciplineMenuEntry = getMenuItemByAttributeValue(navigationData, 'key', disciplineId);
    const headerLabel = disciplineMenuEntry ? disciplineMenuEntry.label : '';

    return {
      id: 'externalTemplateContent', //jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: headerLabel, //jsonDataFromXml.attributes.name,
      descriptionText: '',
      tableEntries: [],
      dataSource: data,
      columns: columns,
      //subPageEntries: subPageEntries, // TODO
    };
  }

  async function getMethodReferenceContent(): Promise<PageEntry> {
    const methodReferenceUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Methodenreferenz/' +
      methodReferenceId;

    let idCounter = 2000;

    const jsonDataFromXml = await getJsonDataFromXml(methodReferenceUrl);

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
    const quelleRefs: XMLElement[] = jsonDataFromXml.getElementsByTagName('QuelleRefs');

    const tableEntries: TableEntry[] = [];

    //////////////////////////////////////////////

    const activitiesData = await getActivitiesData();
    const activitiesToTools: DataEntry[] = [];
    const activitiesToProducts: DataEntry[] = [];

    for (const activity of activitiesData) {
      const methodReferences = activity.getElementsByTagName('MethodenreferenzRef');
      for (const methodReference of methodReferences) {
        if (methodReference.attributes.id === methodReferenceId) {
          /* The method and tool references (reference work aids) contain links to the corresponding activities.
             As the activities are no longer part of the documentation (since version 2.4), the links cannot be resolved.
             Instead of the activity, a link should therefore be created to the product linked to the activity.

             -> So, if the activity id is not in navigation menu change linked site to products page of the activity.
           */

          const foundActivity = getMenuItemByAttributeValue(navigationData, 'key', activity.attributes.id);

          if (foundActivity) {
            activitiesToTools.push({
              id: activity.attributes.id,
              title: activity.attributes.name,
            });
          } else {
            const products = activity.getElementsByTagName('ProduktRef');

            for (const product of products) {
              const foundProduct = getMenuItemByAttributeValue(navigationData, 'key', product.attributes.id);

              if (foundProduct) {
                activitiesToProducts.push({
                  id: product.attributes.id,
                  title: activity.attributes.name,
                  suffix: '(' + product.attributes.name + ')',
                });
              }
            }
          }
        }
      }
    }

    if (activitiesToTools.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: t('translation:label.activities'),
        dataEntries: activitiesToTools,
      });
    } else if (activitiesToProducts.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: t('translation:label.products'),
        dataEntries: activitiesToProducts,
      });
    }

    // //////////////////////////////////////////////

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

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: sinnUndZweck,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  async function getToolReferenceContent(): Promise<PageEntry> {
    const toolReferenceUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Werkzeugreferenz/' +
      toolReferenceId;

    let idCounter = 2000;

    const jsonDataFromXml = await getJsonDataFromXml(toolReferenceUrl);

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
    const quelleRefs: XMLElement[] = jsonDataFromXml.getElementsByTagName('QuelleRefs');

    const tableEntries: TableEntry[] = [];

    //////////////////////////////////////////////

    const activitiesData = await getActivitiesData();
    const activitiesToTools: DataEntry[] = [];
    const activitiesToProducts: DataEntry[] = [];

    for (const activity of activitiesData) {
      const toolReferences = activity.getElementsByTagName('WerkzeugreferenzRef');
      for (const toolReference of toolReferences) {
        if (toolReference.attributes.id === toolReferenceId) {
          /* The method and tool references (reference work aids) contain links to the corresponding activities.
             As the activities are no longer part of the documentation (since version 2.4), the links cannot be resolved.
             Instead of the activity, a link should therefore be created to the product linked to the activity.

             -> So, if the activity id is not in navigation menu change linked site to products page of the activity.
           */

          const foundActivity = getMenuItemByAttributeValue(navigationData, 'key', activity.attributes.id);

          if (foundActivity) {
            activitiesToTools.push({
              id: activity.attributes.id,
              title: activity.attributes.name,
            });
          } else {
            const products = activity.getElementsByTagName('ProduktRef');

            for (const product of products) {
              const foundProduct = getMenuItemByAttributeValue(navigationData, 'key', product.attributes.id);

              if (foundProduct) {
                activitiesToProducts.push({
                  id: product.attributes.id,
                  title: activity.attributes.name,
                  suffix: '(' + product.attributes.name + ')',
                });
              }
            }
          }
        }
      }
    }

    if (activitiesToTools.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: t('translation:label.activities'),
        dataEntries: activitiesToTools,
      });
    } else if (activitiesToProducts.length > 0) {
      tableEntries.push({
        id: (idCounter++).toString(),
        descriptionEntry: t('translation:label.products'),
        dataEntries: activitiesToProducts,
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

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: sinnUndZweck,
      tableEntries: tableEntries,
      // subPageEntries: subPageEntries,
    };
  }

  async function getProjectCharacteristicContent(): Promise<PageEntry> {
    const projectCharacteristicUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projektmerkmal/' +
      projectCharacteristicId;

    const jsonDataFromXml = await getJsonDataFromXml(projectCharacteristicUrl);

    const question = decodeXml(jsonDataFromXml.getElementsByTagName('Frage')[0]?.value);
    const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);
    const values: XMLElement[] = jsonDataFromXml.getElementsByTagName('Wert');

    const data = [];

    for (const value of values) {
      const valueUrl =
        weitApiUrl +
        '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
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
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: fixLinksInText(html) }} />,
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
      weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante/' + tailoringParameter.modelVariantId + '/Abkuerzung/';

    const jsonDataFromXml = await getJsonDataFromXml(abbreviationsUrl);

    const abbreviations: XMLElement[] = jsonDataFromXml.getElementsByTagName('Abkuerzung');

    const data = [];

    for (const abbreviation of abbreviations) {
      const abbreviationUrl =
        weitApiUrl +
        '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
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
        render: (text: any) => <a>{text}</a>,
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
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: fixLinksInText(html) }} />,
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

  function parseWithLinks(text: string) {
    const options = {
      replace: ({ name, attribs, children }) => {
        if (name === 'a' && attribs.href) {
          return (
            <HashLink smooth to={attribs.href + getSearchStringFromHash()}>
              {domToReact(children)}
            </HashLink>
          );
        }
      },
    };

    return parse(text, options);
  }

  async function getGlossaryContent(): Promise<PageEntry> {
    const expressionsUrl =
      weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante/' + tailoringParameter.modelVariantId + '/Begriff/';

    const jsonDataFromXml = await getJsonDataFromXml(expressionsUrl);

    const expressions: XMLElement[] = jsonDataFromXml.getElementsByTagName('Begriff');

    const data = [];

    for (const expression of expressions) {
      const expressionUrl =
        weitApiUrl +
        '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
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
        render: (html: string) => <span>{parseWithLinks(html)}</span>,
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
      weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante/' + tailoringParameter.modelVariantId + '/Quelle/';

    const jsonDataFromXml = await getJsonDataFromXml(sourcesUrl);

    const sources: XMLElement[] = jsonDataFromXml.getElementsByTagName('Quelle');

    const data = [];

    for (const source of sources) {
      const sourceUrl =
        weitApiUrl +
        '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
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
        title: t('translation:label.sourceReference'),
        dataIndex: 'reference',
        key: 'reference',
        render: (html: string) => <span dangerouslySetInnerHTML={{ __html: fixLinksInText(html) }} />,
      },
    ];

    return {
      id: 'literatureContent',
      header: t('translation:label.bibliography'),
      descriptionText: '',
      tableEntries: tableEntries,
      dataSource: data,
      columns: columns,
    };
  }

  async function getProjectTypeContent(): Promise<PageEntry> {
    const projectTypeUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      projectTypeId;

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeUrl);

    const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

    const tableEntries: TableEntry[] = [];

    //////////////////////////////////////////////

    return {
      id: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText: description,
      tableEntries: tableEntries,
    };
  }

  async function getProjectTypeVariantContent(): Promise<PageEntry> {
    const projectTypeVariantUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeVariantUrl);

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

  async function getProjectTypeVariantSequenceContent(): Promise<PageEntry> {
    const projectTypeVariantId = projectTypeVariantSequenceId?.replace('pes_', '');

    const projectTypeVariantSequenceUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeVariantSequenceUrl);

    let idCounter = 2000;

    const title = decodeXml(jsonDataFromXml.attributes.name);
    const projectType: ProjectType = jsonDataFromXml.getElementsByTagName('ProjekttypRef')[0]
      ?.attributes as ProjectType;

    const sequence = decodeXml(jsonDataFromXml.getElementsByTagName('Ablauf')[0]?.value);
    const figureDesignation = getFigureDesignationFromText(sequence);

    const getFigureUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      projectType.id +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Grafik/Abb:' +
      figureDesignation +
      '?' +
      getProjectFeaturesString();

    const imageTag = '<p><img alt="" id="1489155545306" src=' + getFigureUrl + '/></p>';
    const imageDescriptionTag =
      '<p style="margin-top: 0px;">' + '<i>Abbildung [' + figureDesignation + ']: ' + title + '</i></p>';

    //////////////////////////////////////////////

    return {
      id: jsonDataFromXml.attributes.id,
      // menuEntryId: jsonDataFromXml.attributes.id,
      header: jsonDataFromXml.attributes.name,
      descriptionText:
        replaceUrlInText(sequence, tailoringParameter, getProjectFeaturesString()) + imageTag + imageDescriptionTag,
      tableEntries: [],
      // subPageEntries: subPageEntries,
    };
  }

  async function getActivityContent(): Promise<PageEntry> {
    const workAidsActivityUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Aktivitaet/' +
      activityId +
      '?' +
      getProjectFeaturesString();

    const jsonDataFromXml = await getJsonDataFromXml(workAidsActivityUrl);

    let idCounter = 2000;

    const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);
    const activityRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuProduktRef');
    const methodsRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuMethodenreferenzRef');
    const toolsRef: XMLElement[] = jsonDataFromXml.getElementsByTagName('AktivitätZuWerkzeugreferenzRef');
    // const description = decodeXml(jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value);

    const tableEntries: TableEntry[] = [];

    //////////////////////////////////////////////

    const products = activityRef.flatMap((entry) => {
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
  }

  function redirectToFirstChildWithContent(sectionId: string) {
    const currentMenuItem = getMenuItemByAttributeValue(navigationData, 'key', sectionId);
    const currentChildren = currentMenuItem?.children;

    if (currentChildren?.length > 0) {
      const childId = currentChildren[0].key;

      if (childId) {
        setSelectedItemKey(childId);

        navigate(`/documentation/${childId}${getSearchStringFromHash()}`);
      }
    }
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
              <div style={{ padding: '24px', flex: '1 0 auto' }}>
                <PageEntryContent />
              </div>
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
