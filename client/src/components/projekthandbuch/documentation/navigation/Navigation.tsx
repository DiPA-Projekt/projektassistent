import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  AuditOutlined,
  FileProtectOutlined,
  GlobalOutlined,
  HomeOutlined,
  OrderedListOutlined,
  PaperClipOutlined,
  ScissorOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Spin } from 'antd';
import { getJsonDataFromXml, getMenuItemByAttributeValue, getSearchStringFromHash } from '../../../../shares/utils';
// import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { useDocumentation } from '../../../../context/DocumentationContext';

import 'antd/dist/reset.css';
import { XMLElement } from 'react-xml-parser';
import { useTailoring } from '../../../../context/TailoringContext';
import { weitApiUrl } from '../../../app/App';
import { useTranslation } from 'react-i18next';

const { Sider } = Layout;

export enum NavTypeEnum {
  PRODUCT = 'product',
  CONTENT_PRODUCT_DEPENDENCY = 'contentProductDependency',
  TOPIC = 'topic',
  EXTERNAL_TEMPLATE = 'externalTemplate',
  DISCIPLINE = 'discipline',
  PROJECT_ROLE = 'projectRole',
  PROJECT_TEAM_ROLE = 'projectTeamRole',
  ORGANISATION_ROLE = 'organisationRole',
  DECISION_POINT = 'decisionPoint',
  PROCESS_MODULE = 'processModule',
  PROCESS_BUILDING_BLOCK = 'processBuildingBlock',
  ACTIVITY = 'activity',
  ACTIVITY_DISCIPLINE = 'activityDiscipline',
  METHOD_REFERENCE = 'methodReference',
  TOOL_REFERENCE = 'toolReference',
  PROJECT_TYPE_VARIANT = 'projectTypeVariant',
  PROJECT_TYPE_VARIANT_SEQUENCE = 'projectTypeVariantSequence',
  PROJECT_TYPE = 'projectType',
  PROJECT_CHARACTERISTIC = 'projectCharacteristic',
  TEMPLATE_DISCIPLINE = 'templateDiscipline',
  PRODUCT_DISCIPLINE = 'productDiscipline',
  SAMPLE_TEXT = 'sampleText',
}

export enum IndexTypeEnum {
  PRODUCT = 'productIndex',
  ROLE = 'roleIndex',
  PROCESS = 'processIndex',
  TAILORING = 'tailoringIndex',
  WORK_AIDS = 'workAidsIndex',
  GLOSSARY = 'glossaryIndex',
  ABBREVIATIONS = 'abbreviationsIndex',
  LITERATURE = 'literatureIndex',
}

function renderIcon(param: string | undefined): React.ReactNode {
  switch (param) {
    case 'Einstieg in das projektspezifische V-Modell':
      return <AuditOutlined />;
    case 'Einstieg in das V-Modell XT':
    case 'Einstieg in das V-Modell XT Bund':
    case 'Einstieg in das V-Modell XT ITZBund':
      return <HomeOutlined />;
    case 'Konzepte und Inhalte des V-Modell XT':
    case 'Konzepte und Inhalte des V-Modell XT Bund':
    case 'Konzepte und Inhalte des V-Modell XT ITZBund':
      return <FileProtectOutlined />;
    case 'Eine Tour durch das V-Modell XT ITZBund':
      return <GlobalOutlined />;
    case 'Referenz Produkte':
      return <ShoppingOutlined />;
    case 'Referenz Rollen':
      return <TeamOutlined />;
    case 'Referenz Abläufe':
      return <OrderedListOutlined />;
    case 'Referenz Tailoring':
      return <ScissorOutlined />;
    case 'Referenz Arbeitshilfen':
      return <ToolOutlined />;
    case 'Anhang':
      return <PaperClipOutlined />;
    default:
      return undefined;
  }
}

// TODO: OpenApi
export interface Section {
  id: string;
  version?: string;
  name: string;
  children: Section[];
}

// TODO: OpenApi
export interface SectionDetail {
  generatedContent: string;
  replacedContent?: NavMenuItem[];
  mergedChildren?: NavMenuItem[];
  addedChildren?: NavMenuItem[];
  indexItem?: { key: string; label: string; onClick: () => any };
}

export type NavMenuItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onTitleClick?: Function;
  onClick?: Function;
  children?: NavMenuItem[];
  dataType?: NavTypeEnum;
  parent?: NavMenuItem;
};

const excludeNavItemLabels = ['Einstieg in das projektspezifische V-Modell', 'Projektdurchführungsstrategie'];

// @withRouter
export function Navigation() {
  const { t } = useTranslation();

  const {
    setSelectedItemKey,
    setSelectedIndexType,
    collapsed,
    navigationData,
    setNavigationData,
    currentSelectedKeys,
    // openKeys,
  } = useDocumentation();

  const navigate = useNavigate();
  // const location = useLocation();

  const [loading, setLoading] = useState(false);

  const { tailoringParameter, getProjectFeaturesQueryString } = useTailoring();

  const productToDisciplineMap = new Map<string, { key: string; title: string }>();

  useEffect(() => {
    async function mount() {
      if (tailoringParameter.modelVariantId) {
        setLoading(true);
        //TODO: getDisciplineIds
        await fetchData();
        setLoading(false);
      }
    }

    void mount().then();
    //eslint-disable-next-line
  }, [tailoringParameter.modelVariantId]);

  // https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/c62d12f444739b2/Kapitel

  // function getProjectFeaturesString(): string {
  //   return Object.keys(projectFeatureIdsSearchParam)
  //     .map((key: string) => {
  //       return `${key}=${projectFeatureIdsSearchParam[key]}`;
  //     })
  //     .join('&');
  // }

  function handleSelectedItem(key: string) {
    setSelectedItemKey(key);
    // console.log('location', location);
    navigate(`/documentation/${key}${getSearchStringFromHash()}`);
  }

  async function addParentRecursive(items: NavMenuItem[]): Promise<NavMenuItem[]> {
    for (const item of items) {
      if (item.children) {
        let currentGeneratedChildren: NavMenuItem[] = [];

        let i = 0;
        for (const child of item.children) {
          let foundInGeneratedChildren = false;

          if (currentGeneratedChildren.length > 0) {
            const foundMenuItem = getMenuItemByAttributeValue(currentGeneratedChildren, 'key', child.key);
            if (foundMenuItem) {
              item.children[i] = foundMenuItem;
              foundInGeneratedChildren = true;
            }
          }

          if (!foundInGeneratedChildren && child.key) {
            child.parent = item;
            if (!child.parent) {
              console.log('child.parent null', item);
            }

            const test = await fetchSectionDetailsData(child);
            if (test.replacedContent) {
              item.children = test.replacedContent;
            } else if (test.mergedChildren) {
              // ermittle child Einträge!
              currentGeneratedChildren = test.mergedChildren;

              // TODO: für das erste muss das auch gemacht werden... vllt sollte man es daher rausziehen
              const foundMenuItem = getMenuItemByAttributeValue(currentGeneratedChildren, 'key', child.key);
              if (foundMenuItem) {
                item.children[i] = foundMenuItem;
              }
            } else if (test.addedChildren) {
              child.children = test.addedChildren;
            } else if (test.indexItem) {
              item.children[i] = test.indexItem;
            }
          }
          i++;
          // }
        }
        if (item.children && item.children.length > 0) {
          item.onTitleClick = (item: any) => handleSelectedItem(item.key);
          await addParentRecursive(item.children);
        } else {
          item.onClick = (item: any) => handleSelectedItem(item.key);
          item.children = undefined;
        }
      }
    }

    return items;
  }

  async function fetchSectionDetailsData(childItem: NavMenuItem): Promise<SectionDetail> {
    const sectionId = childItem.key;

    if (!tailoringParameter.modelVariantId) {
      return undefined;
    }

    const sectionDetailUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Kapitel/' +
      sectionId;

    const jsonDataFromXml = await getJsonDataFromXml(sectionDetailUrl);

    const generatedContent = jsonDataFromXml.attributes.GenerierterInhalt;
    const isReplaced = jsonDataFromXml.attributes.WirdErsetzt;

    let replacedContent;
    let mergedChildren; // for merging children
    let addedChildren; // for adding children

    // TODO: anders lösen
    let indexItem;

    // const xmlDataWithParent = addParentRecursive([jsonDataFromXml]);
    if (isReplaced === 'Ja') {
      if (generatedContent === 'Elemente:Produkte_mit_Themen_nach_Disziplinen' && childItem.parent) {
        replacedContent = await getReferenceProducts(childItem.parent);
      } else {
        console.log('muss noch ersetzt werden', jsonDataFromXml);
      }
    }

    if (generatedContent) {
      if (generatedContent === 'Spezialkapitel:Disziplingruppe' && childItem.parent) {
        // TODO
        const disciplineIds = await getDisciplineIds();
        addedChildren = getDisciplineGroup(childItem.parent, jsonDataFromXml).filter((navMenuItem) =>
          disciplineIds.includes(navMenuItem.key)
        );
      } else {
        switch (generatedContent) {
          case 'Index:Produkte': {
            indexItem = {
              key: childItem.key,
              label: childItem.label,
              onClick: () => setSelectedIndexType(IndexTypeEnum.PRODUCT),
            };
            break;
          }
          case 'Index:Rollen': {
            indexItem = {
              key: childItem.key,
              label: childItem.label,
              onClick: () => setSelectedIndexType(IndexTypeEnum.ROLE),
            };
            break;
          }
          case 'Index:Abläufe': {
            indexItem = {
              key: childItem.key,
              label: childItem.label,
              onClick: () => setSelectedIndexType(IndexTypeEnum.PROCESS),
            };
            break;
          }
          case 'Index:Tailoring': {
            indexItem = {
              key: childItem.key,
              label: childItem.label,
              onClick: () => setSelectedIndexType(IndexTypeEnum.TAILORING),
            };
            break;
          }
          case 'Index:Arbeitshilfen': {
            indexItem = {
              key: childItem.key,
              label: childItem.label,
              onClick: () => setSelectedIndexType(IndexTypeEnum.WORK_AIDS),
            };
            break;
          }
        }
      }
    }

    if (
      childItem.parent?.label === 'Produktabhängigkeiten' &&
      childItem.label === 'Inhaltliche Produktabhängigkeiten'
    ) {
      addedChildren = await getContentProductDependencies(childItem.parent);
    }

    if (childItem.parent?.label === 'Referenz Rollen' && childItem.label !== 'Rollenindex') {
      // "Rollenindex" Spezialfall
      mergedChildren = await getReferenceRoles(childItem.parent);
    }

    if (childItem.parent?.label === 'Referenz Tailoring' && childItem.label === 'Vorgehensbausteine') {
      addedChildren = await getTailoringProcessBuildingBlocks(childItem);
    }

    if (
      childItem.parent?.label === 'Referenz Tailoring' &&
      childItem.label === 'Projekttypen und Projekttypvarianten'
    ) {
      addedChildren = await getProductTypesAndProductTypeVariants(childItem);
    }

    if (childItem.parent?.label === 'Referenz Abläufe' && childItem.label === 'Projektdurchführungsstrategien') {
      addedChildren = await getProjectExecutionStrategies(childItem);
    }

    if (childItem.parent?.label === 'Referenz Tailoring' && childItem.label === 'Projektmerkmale') {
      addedChildren = await getProjectCharacteristics(childItem);
    }

    if (childItem.parent?.label === 'Referenz Arbeitshilfen' && childItem.label === 'Aktivitäten') {
      addedChildren = await getWorkAidsActivities(childItem);
    }

    if (childItem.parent?.label === 'Methoden und Werkzeuge' && childItem.label === 'Methodenreferenzen') {
      addedChildren = await getWorkAidsMethodReferences(childItem);
    }

    if (childItem.parent?.label === 'Methoden und Werkzeuge' && childItem.label === 'Werkzeugreferenzen') {
      addedChildren = await getWorkAidsToolReferences(childItem);
    }

    if (childItem.parent?.label === 'Referenz Abläufe' && childItem.label === 'Entscheidungspunkte') {
      addedChildren = await getDecisionPoints(childItem);
    }

    if (childItem.parent?.label === 'Referenz Abläufe' && childItem.label === 'Ablaufbausteine') {
      addedChildren = await getProcessModules(childItem);
    }

    if (childItem.parent?.label === 'Produktvorlagen' && childItem.label === 'Übersicht über Produktvorlagen') {
      addedChildren = await getTemplates(childItem);
    }

    // const sections: Section[] = jsonDataFromXml.getElementsByTagName('Kapitel').map((section: any) => {
    //   return section.attributes as Section;
    // });

    return {
      // text: textPart,
      generatedContent: generatedContent,
      // generierterInhaltErsetzend: generierterInhaltErsetzend,
      replacedContent: replacedContent,
      mergedChildren: mergedChildren,
      addedChildren: addedChildren,
      indexItem: indexItem,
    };
    // setSectionsDetailsData(xmlDataWithParent);
  }

  function xmlDataToNavMenuItem(jsonDataFromXml: XMLElement): NavMenuItem {
    return {
      key: jsonDataFromXml.attributes.id,
      label: jsonDataFromXml.attributes.titel,
      icon: renderIcon(jsonDataFromXml.attributes.titel),
      children: jsonDataFromXml.children.filter((child) => child.name === 'Kapitel').map(xmlDataToNavMenuItem),
    };
  }

  function removeFromArrayOfObj(array: NavMenuItem[], labelsToRemove: string[]) {
    for (const [i, e] of array.entries()) {
      if (labelsToRemove.includes(e.label)) {
        array.splice(i, 1);
        continue;
      }
      if (e.children) {
        removeFromArrayOfObj(e.children, labelsToRemove);
      }
    }
    return array;
  }

  async function fetchData(): Promise<void> {
    const sectionUrl =
      weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante/' + tailoringParameter.modelVariantId + '/Kapitel/';

    const jsonDataFromXml = await getJsonDataFromXml(sectionUrl);

    const navMenuItems = xmlDataToNavMenuItem(jsonDataFromXml);
    const filteredNavMenuItems = removeFromArrayOfObj(navMenuItems.children, excludeNavItemLabels);

    const xmlDataWithParent = await addParentRecursive(filteredNavMenuItems || []);

    setNavigationData(xmlDataWithParent);
  }

  async function getDisciplineIds(): Promise<string[]> {
    const disciplinesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(disciplinesUrl);

    return jsonDataFromXml.getElementsByTagName('Disziplin').map((disciplineValue) => {
      return disciplineValue.attributes.id;
    });
  }

  async function getReferenceProducts(target: NavMenuItem): Promise<NavMenuItem[]> {
    const referenceProductsUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Disziplin?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(referenceProductsUrl);

    return jsonDataFromXml.getElementsByTagName('Disziplin').map((disciplineValue) => {
      const disciplineEntry: NavMenuItem = {
        key: 'productDiscipline_' + disciplineValue.attributes.id,
        parent: target,
        label: disciplineValue.attributes.name,
        dataType: NavTypeEnum.PRODUCT_DISCIPLINE,
        onTitleClick: (item: any) => handleSelectedItem(item.key),
      };

      const products: NavMenuItem[] = disciplineValue
        .getElementsByTagName('Produkt')
        .map((productValue): NavMenuItem => {
          // TODO: besser woanders?
          productToDisciplineMap.set(productValue.attributes.id, {
            key: disciplineValue.attributes.id,
            title: disciplineValue.attributes.name,
          });

          return {
            key: productValue.attributes.id,
            parent: disciplineEntry,
            label: productValue.attributes.name,
            dataType: NavTypeEnum.PRODUCT,
            onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
            // children: [],
          };
        });

      disciplineEntry.children = products;

      return disciplineEntry;
    });
  }

  function getDisciplineGroup(target: NavMenuItem, jsonDataFromXml: XMLElement): NavMenuItem[] {
    return jsonDataFromXml.getElementsByTagName('DisziplinRef').map((disciplineValue) => {
      return {
        key: disciplineValue.attributes.id,
        parent: target,
        label: disciplineValue.attributes.name,
        dataType: NavTypeEnum.DISCIPLINE,
        onClick: (item: any) => handleSelectedItem(item.key),
      };
    });
  }

  async function getReferenceRoles(target: NavMenuItem): Promise<NavMenuItem[]> {
    const referenceRolesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Rollenkategorie?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(referenceRolesUrl);

    const rolesNavigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Rollenkategorie')
      .map((roleCategoryValue) => {
        // in Kapitel the role entries are named "Projektrollen", "Organisationsrollen" and "Projektteamrollen"
        // in Rollenkategorie they are named im singular "Projektrolle", "Organisationsrolle" and "Projektteamrolle"
        const roleCategoryName = roleCategoryValue.attributes.name;
        const roleCategoryNavItem = target.children?.find(
          (child: any) => child.label.includes(roleCategoryName) // TODO: hier macht es Probleme, dass einige Einträge schon keine attributes.titel mehr haben... besser wir ändern nicht das ursprüngliche Object
        );

        let roleCategoryEntry: NavMenuItem;

        if (roleCategoryNavItem) {
          roleCategoryEntry = {
            key: roleCategoryNavItem.key, // roleCategory has no id
            parent: target,
            label: roleCategoryNavItem.label,
            onTitleClick: (item: any) => handleSelectedItem(item.key),
          };
        }

        // TODO: über Variablen lösen?!
        let navTypeRole: NavTypeEnum;
        switch (roleCategoryName) {
          case 'Projektteamrolle':
            navTypeRole = NavTypeEnum.PROJECT_TEAM_ROLE;
            break;
          case 'Projektrolle':
            navTypeRole = NavTypeEnum.PROJECT_ROLE;
            break;
          case 'Organisationsrolle':
            navTypeRole = NavTypeEnum.ORGANISATION_ROLE;
            break;
        }

        const roles: NavMenuItem[] = roleCategoryValue
          .getElementsByTagName('RolleRef')
          .map((roleValue: any): NavMenuItem => {
            return {
              key: roleValue.attributes.id,
              parent: roleCategoryEntry,
              label: roleValue.attributes.name,
              dataType: navTypeRole,
              onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
            };
          });

        roleCategoryEntry.children = roles;

        return roleCategoryEntry;
      });

    return rolesNavigation;
  }

  async function getDecisionPoints(target: NavMenuItem): Promise<NavMenuItem[]> {
    // TODO: getUrl as function
    if (
      !weitApiUrl ||
      !tailoringParameter.modelVariantId ||
      !tailoringParameter.projectTypeId ||
      !tailoringParameter.projectTypeVariantId
    ) {
      return [];
    }
    const decisionPointsUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Entscheidungspunkt?' +
      String(getProjectFeaturesQueryString());

    const jsonDataFromXml = await getJsonDataFromXml(decisionPointsUrl);

    const entscheidungspunkte: XMLElement[] = jsonDataFromXml.getElementsByTagName('Entscheidungspunkt');

    return entscheidungspunkte.map((decisionPointValue) => {
      return {
        key: decisionPointValue.attributes.id,
        parent: target,
        label: decisionPointValue.attributes.name,
        dataType: NavTypeEnum.DECISION_POINT,
        onClick: (item: any) => handleSelectedItem(item.key),
      };
    });
  }

  async function getProcessModules(target: NavMenuItem): Promise<NavMenuItem[]> {
    const processModulesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Ablaufbaustein?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(processModulesUrl);

    const ablaufbausteine: XMLElement[] = jsonDataFromXml.getElementsByTagName('Ablaufbaustein');

    return ablaufbausteine.map((processModuleValue) => {
      return {
        key: processModuleValue.attributes.id,
        parent: target,
        label: processModuleValue.attributes.name,
        dataType: NavTypeEnum.PROCESS_MODULE,
        onClick: (item: any) => handleSelectedItem(item.key),
      };
    });
  }

  async function getContentProductDependencies(target: NavMenuItem): Promise<NavMenuItem[]> {
    const contentProductDependenciesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/InhaltlicheAbhaengigkeitenGruppe?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(contentProductDependenciesUrl);

    const contentProductDependencies = jsonDataFromXml.getElementsByTagName('InhaltlicheAbhängigkeit');

    const result: NavMenuItem[] = [];
    const map = new Map();

    for (const contentProductDependency of contentProductDependencies) {
      if (!map.has(contentProductDependency.attributes.id)) {
        map.set(contentProductDependency.attributes.id, true);
        result.push({
          key: contentProductDependency.attributes.id,
          parent: target,
          label: contentProductDependency.attributes.name,
          dataType: NavTypeEnum.CONTENT_PRODUCT_DEPENDENCY,
          onClick: (item: any) => handleSelectedItem(item.key),
        });
      }
    }

    return result.sort(function (a, b) {
      return a.label < b.label ? -1 : 1;
    });
  }

  async function getTailoringProcessBuildingBlocks(target: NavMenuItem): Promise<NavMenuItem[]> {
    const tailoringProcessBuildingBlocksUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Vorgehensbaustein?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    return jsonDataFromXml.getElementsByTagName('Vorgehensbaustein').map((processBuildingBlockValue) => {
      return {
        key: processBuildingBlockValue.attributes.id,
        parent: target,
        label: processBuildingBlockValue.attributes.name,
        dataType: NavTypeEnum.PROCESS_BUILDING_BLOCK,
        onClick: (item: any) => handleSelectedItem(item.key),
      };
    });
  }

  async function getWorkAidsActivities(target: NavMenuItem): Promise<NavMenuItem[]> {
    const workAidsActivitiesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/Aktivitaet?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(workAidsActivitiesUrl);

    const disciplineEntriesMap = new Map<string, NavMenuItem>();

    jsonDataFromXml.getElementsByTagName('Aktivität').map((activityReference) => {
      const productRef = activityReference.getElementsByTagName('ProduktRef')[0];

      const productToDisciplineEntryKey = productToDisciplineMap.get(productRef.attributes.id)!.key;

      if (!disciplineEntriesMap.get(productToDisciplineEntryKey)) {
        disciplineEntriesMap.set(productToDisciplineEntryKey, {
          key: 'ACTIVITY_DISCIPLINE_' + productToDisciplineEntryKey, // TODO: check !
          parent: target,
          children: [],
          label: productToDisciplineMap.get(productRef.attributes.id)!.title, // TODO: check !
          dataType: NavTypeEnum.ACTIVITY_DISCIPLINE,
          onTitleClick: (item: any) => handleSelectedItem(item.key),
        });
      }

      const product = {
        key: activityReference.attributes.id,
        parent: disciplineEntriesMap.get(productToDisciplineEntryKey), //disciplineEntry,
        label: activityReference.attributes.name,
        dataType: NavTypeEnum.ACTIVITY,
        onClick: (item: any) => handleSelectedItem(item.key),
      };

      disciplineEntriesMap.get(productToDisciplineEntryKey)!.children!.push(product);
    });

    const disciplineEntries = Array.from(disciplineEntriesMap.values());
    for (const disciplineEntry of disciplineEntries) {
      disciplineEntry.children = disciplineEntry.children?.sort(function (a, b) {
        return a.label < b.label ? -1 : 1;
      });
    }

    return disciplineEntries.sort(function (a, b) {
      return a.label < b.label ? -1 : 1;
    });
  }

  async function getWorkAidsMethodReferences(target: NavMenuItem): Promise<NavMenuItem[]> {
    const workAidsMethodReferencesUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Methodenreferenz';

    const jsonDataFromXml = await getJsonDataFromXml(workAidsMethodReferencesUrl);

    return jsonDataFromXml.getElementsByTagName('Methodenreferenz').map((methodReference) => {
      return {
        key: methodReference.attributes.id,
        parent: target,
        label: methodReference.attributes.name,
        dataType: NavTypeEnum.METHOD_REFERENCE,
        onClick: (item: any) => handleSelectedItem(item.key),
      };
    });
  }

  async function getWorkAidsToolReferences(target: NavMenuItem): Promise<NavMenuItem[]> {
    const workAidsToolReferencesUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Werkzeugreferenz';

    const jsonDataFromXml = await getJsonDataFromXml(workAidsToolReferencesUrl);

    return jsonDataFromXml.getElementsByTagName('Werkzeugreferenz').map((toolReference) => {
      return {
        key: toolReference.attributes.id,
        parent: target,
        label: toolReference.attributes.name,
        dataType: NavTypeEnum.TOOL_REFERENCE,
        onClick: (item: any) => handleSelectedItem(item.key),
      };
    });
  }

  async function getTemplates(target: NavMenuItem): Promise<NavMenuItem[]> {
    const templatesUrl =
      weitApiUrl +
      '/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      tailoringParameter.projectTypeId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId +
      '/ExterneKopiervorlage?' +
      getProjectFeaturesQueryString();

    const jsonDataFromXml = await getJsonDataFromXml(templatesUrl);

    const disciplineEntriesMap = new Map<string, NavMenuItem>();

    jsonDataFromXml.getElementsByTagName('ExterneKopiervorlage').map((externalMasterTemplate) => {
      const productRef = externalMasterTemplate.getElementsByTagName('ProduktRef')[0];

      if (productRef.attributes.id) {
        const productToDisciplineEntryKey = productToDisciplineMap.get(productRef.attributes.id)!.key;

        if (!disciplineEntriesMap.get(productToDisciplineEntryKey)) {
          disciplineEntriesMap.set(productToDisciplineEntryKey, {
            key: 'td_' + productToDisciplineEntryKey, // TODO: check !
            parent: target,
            label: productToDisciplineMap.get(productRef.attributes.id)!.title, // TODO: check !
            dataType: NavTypeEnum.TEMPLATE_DISCIPLINE,
            onClick: (item: any) => handleSelectedItem(item.key),
          });
        }
      }
    });

    const disciplineEntries = Array.from(disciplineEntriesMap.values());

    return disciplineEntries.sort(function (a, b) {
      return a.label < b.label ? -1 : 1;
    });
  }

  async function getProjectCharacteristics(target: NavMenuItem): Promise<NavMenuItem[]> {
    const projectCharacteristicsUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projektmerkmal';

    const jsonDataFromXml = await getJsonDataFromXml(projectCharacteristicsUrl);

    return jsonDataFromXml
      .getElementsByTagName('Projektmerkmal')
      .filter((projectCharacteristic) =>
        // Restrict to the current tailored project features
        Object.keys(tailoringParameter.projectFeatures).includes(projectCharacteristic.attributes.id)
      )
      .map((projectCharacteristic) => {
        return {
          key: projectCharacteristic.attributes.id,
          parent: target,
          label: projectCharacteristic.attributes.name,
          dataType: NavTypeEnum.PROJECT_CHARACTERISTIC,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });
  }

  async function getProductTypesAndProductTypeVariants(target: NavMenuItem): Promise<NavMenuItem[]> {
    const projectTypeVariantsUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId; // Restrict to the current tailored project type variant id

    const jsonDataFromXmlProjectTypeVariants = await getJsonDataFromXml(projectTypeVariantsUrl);

    const navigation: NavMenuItem[] = [];

    jsonDataFromXmlProjectTypeVariants.getElementsByTagName('Projekttypvariante').map((projectTypeVariantValue) => {
      const projectTypeValue = projectTypeVariantValue.getElementsByTagName('ProjekttypRef')[0];

      let projectType = getMenuItemByAttributeValue(navigation, 'key', projectTypeValue.attributes.id);
      if (projectType === undefined) {
        projectType = {
          key: projectTypeValue.attributes.id,
          parent: target,
          label: projectTypeValue.attributes.name,
          dataType: NavTypeEnum.PROJECT_TYPE,
          onTitleClick: (item: any) => handleSelectedItem(item.key),
          children: [],
        };

        navigation.push(projectType);
      }

      projectType.children.push({
        key: projectTypeVariantValue.attributes.id,
        parent: projectTypeValue,
        label: projectTypeVariantValue.attributes.name,
        dataType: NavTypeEnum.PROJECT_TYPE_VARIANT,
        onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
      });
    });

    return navigation;
  }

  async function getProjectExecutionStrategies(target: NavMenuItem): Promise<NavMenuItem[]> {
    const projectTypeVariantsUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante'; // TODO: parameter setzen?

    const jsonDataFromXmlProjectTypeVariants = await getJsonDataFromXml(projectTypeVariantsUrl);

    const navigation: NavMenuItem[] = [];

    jsonDataFromXmlProjectTypeVariants.getElementsByTagName('Projekttypvariante').map((projectTypeVariantValue) => {
      navigation.push({
        key: 'pes_' + projectTypeVariantValue.attributes.id,
        parent: target,
        label: projectTypeVariantValue.attributes.name,
        dataType: NavTypeEnum.PROJECT_TYPE_VARIANT_SEQUENCE, // TODO: oder auch ProjectExecutionStrategy
        onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
      });
    });

    return navigation;
  }

  return (
    <>
      <Spin tip={t('text.generateNavigation') + '...'} spinning={loading}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={50}
          // onCollapse={() => {
          //   toggleCollapse();
          //   // this.forceUpdate();
          // }}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0,
          }}
        >
          {navigationData.length > 0 && (
            <Menu
              className="sideMenu"
              mode="inline"
              inlineIndent={12}
              items={navigationData}
              selectedKeys={currentSelectedKeys}
              // openKeys={openKeys} // TODO: funzt noch nicht
            />
          )}

          {/*<NavMenu data={sectionsData} />*/}
        </Sider>
      </Spin>
    </>
  );
}
