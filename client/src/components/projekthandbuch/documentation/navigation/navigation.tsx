import React, { useEffect, useState } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  FileProtectOutlined,
  HomeOutlined,
  OrderedListOutlined,
  PaperClipOutlined,
  ScissorOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { getJsonDataFromXml, getMenuItemByAttributeValue } from '../../../../shares/utils';
// import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { useDocumentation } from '../../../../context/DocumentationContext';

import 'antd/dist/reset.css';
import { XMLElement } from 'react-xml-parser';

const { Sider } = Layout;

export enum NavTypeEnum {
  PRODUCT = 'product',
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
    case 'Einstieg in das V-Modell XT':
    case 'Einstieg in das V-Modell XT Bund':
      return <HomeOutlined />;
    case 'Konzepte und Inhalte des V-Modell XT':
    case 'Konzepte und Inhalte des V-Modell XT Bund':
      return <FileProtectOutlined />;
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
      return '';
  }
}

// TODO: OpenApi
export interface Section {
  id: string;
  version?: string;
  name: string;
  children: Section[];
}

export interface NavMenuItem {
  key: string;
  label: string;
  icon?: string;
  onTitleClick?: Function;
  onClick?: Function;
  children?: NavMenuItem[];
  dataType?: NavTypeEnum;
  parent: NavMenuItem;
}

interface MyType {
  [key: string]: string;
}

// @withRouter
export function Navigation() {
  const {
    setSelectedItemKey,
    setSelectedIndexType,
    /*sectionsData,*/ navigationData,
    setNavigationData,
    currentSelectedKeys,
    openKeys,
  } = useDocumentation();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams /*, setSearchParams*/] = useSearchParams();
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

  const [collapsed, setCollapsed] = useState<boolean>(false);

  const productToDisciplineMap = new Map<string, { key: string; title: string }>();

  useEffect(() => {
    async function mount() {
      await fetchData();
    }

    mount().then();
    //eslint-disable-next-line
  }, [modelVariantId]);

  function toggleCollapse(): void {
    setCollapsed(!collapsed);
  }

  // https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/c62d12f444739b2/Kapitel

  function getProjectFeaturesString(): string {
    return Object.keys(projectFeatureIdsSearchParam)
      .map((key: string) => {
        return `${key}=${projectFeatureIdsSearchParam[key]}`;
      })
      .join('&');
  }

  function handleSelectedItem(key: string) {
    setSelectedItemKey(key);
    console.log('location', location);
    navigate(`/documentation/${key}${location.search}`);
  }

  function eachRecursive(obj, parents = [], result = {}) {
    // var parents = arguments[1] || [];
    // let result = arguments[2] || {};
    for (const k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] == 'object' && obj[k] !== null) {
        result[k] = { name: obj[k].name, parents: parents.slice() };
        parents.push(k);
        eachRecursive(obj[k].children, parents, result);
        parents.pop();
      } else {
        result[k] = { name: obj[k].name, parents: parents.slice() };
      }
    }
    return result;
  }

  async function addParentRecursive(items: XMLElement[], result: NavMenuItem[]): Promise<any[]> {
    for (const item of items) {
      // item.children = item.children?.filter((child) => child.name === 'Kapitel');
      item.icon = renderIcon(item.attributes?.titel);

      if (item.children) {
        let currentGeneratedChildren: NavMenuItem[] = [];

        let i = 0;
        for (let child of item.children) {
          // TODO: cleanup
          if (child.name !== 'Kapitel') {
            //   const removed = item.children.splice(i, 1);
            //   console.log('removed', removed);
            //   // delete item.children[i];
          } else {
            let foundInGeneratedChildren = false;

            if (currentGeneratedChildren.length > 0) {
              console.log(currentGeneratedChildren);

              const gefunden = getMenuItemByAttributeValue(currentGeneratedChildren, 'key', child.attributes?.id);
              if (gefunden) {
                item.children[i] = gefunden;
                // child = gefunden;
                foundInGeneratedChildren = true;
              }
            }

            if (!foundInGeneratedChildren && child.attributes?.id) {
              // child.parentId = item.attributes.id;
              child.parent = item;
              if (!child.parent) {
                console.log('child.parent null', item);
              }
              child.key = child.attributes.id;
              //child.label = <Link to={child.attributes.id}>{child.attributes.titel}</Link>;
              child.label = child.attributes.titel;
              child.onTitleClick = (item: any) => handleSelectedItem(item.key);
              // console.log('child.attributes.id', child.attributes.id, child.attributes.titel, child.attributes);

              // setSelectedItemKey(child.attributes.id);

              const test = await fetchSectionDetailsData(child);
              if (test.replacedContent) {
                item.children = test.replacedContent;
                console.log('ersetze', test);
                // child = test;
              } else if (test.mergedChildren) {
                // item.children = test.replacedContent;
                // child = test;
                // ermittle child Einträge!
                currentGeneratedChildren = test.mergedChildren;

                // TODO: für das erste muss das auch gemacht werden... vllt sollte man es daher rausziehen
                const gefunden = getMenuItemByAttributeValue(currentGeneratedChildren, 'key', child.attributes?.id);
                if (gefunden) {
                  item.children[i] = gefunden;
                  // child = gefunden;
                  // foundInGeneratedChildren = true;
                }

                console.log('generatedContent', test.generatedContent);
              } else if (test.addedChildren) {
                child.children = test.addedChildren;
                console.log('addedChildren', test.addedChildren);
              } else if (test.indexItem) {
                // item.children[i] = test.indexItem;
                console.log('indexItem', test);
                item.children[i] = test.indexItem;
              }
            }
            i++;
          }
        }

        await addParentRecursive(item.children, result);
      }
    }

    return items;
  }

  // TODO: kann optimiert werden, sodass alle Infos nur einmal geholte werden und alle zu ersetzenden Seiten vorher ermittelt werden
  async function fetchSectionDetailsData(childItem: any): Promise<any> {
    const sectionId = childItem.attributes.id;

    const sectionDetailUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Kapitel/' +
      sectionId;

    const jsonDataFromXml: any = await getJsonDataFromXml(sectionDetailUrl);

    //console.log("jsonDataFromXml.getElementsByTagName('Kapitel')", jsonDataFromXml.getElementsByTagName('Kapitel'));
    // TODO: save textPart
    const textPart = jsonDataFromXml.children.find((child: any) => child.name === 'Text')?.value;
    const generatedContent = jsonDataFromXml.attributes.GenerierterInhalt;
    const wirdErsetzt = jsonDataFromXml.attributes.WirdErsetzt;
    // const generierterInhaltErsetzend = jsonDataFromXml.attributes.GenerierterInhaltErsetzend;

    let replacedContent;
    let mergedChildren; // for merging children
    let addedChildren; // for adding children

    // TODO: anders lösen
    let indexItem;

    // TODO: generatedContent = Elemente:Projektrollen
    // TODO: generatedContent = Elemente:Organisationsrollen
    // TODO: generatedContent = Elemente:Projektteamrollen

    // const xmlDataWithParent = addParentRecursive([jsonDataFromXml]);
    if (wirdErsetzt === 'Ja') {
      if (generatedContent === 'Elemente:Produkte_mit_Themen_nach_Disziplinen') {
        replacedContent = await getReferenceProducts(childItem.parent);
      } else {
        console.log('muss noch ersetzt werden', jsonDataFromXml);
      }
    }

    if (generatedContent) {
      switch (generatedContent) {
        case 'Index:Produkte': {
          indexItem = {
            key: childItem.attributes.id,
            label: childItem.attributes.titel,
            onClick: () => setSelectedIndexType(IndexTypeEnum.PRODUCT),
          };
          break;
        }
        case 'Index:Rollen': {
          indexItem = {
            key: childItem.attributes.id,
            label: childItem.attributes.titel,
            onClick: () => setSelectedIndexType(IndexTypeEnum.ROLE),
          };
          break;
        }
        case 'Index:Abläufe': {
          indexItem = {
            key: childItem.attributes.id,
            label: childItem.attributes.titel,
            onClick: () => setSelectedIndexType(IndexTypeEnum.PROCESS),
          };
          break;
        }
        case 'Index:Tailoring': {
          indexItem = {
            key: childItem.attributes.id,
            label: childItem.attributes.titel,
            onClick: () => setSelectedIndexType(IndexTypeEnum.TAILORING),
          };
          break;
        }
        case 'Index:Arbeitshilfen': {
          indexItem = {
            key: childItem.attributes.id,
            label: childItem.attributes.titel,
            onClick: () => setSelectedIndexType(IndexTypeEnum.WORK_AIDS),
          };
          break;
        }
      }
    }

    // TODO: warum ist hier wirdErsetzt nicht gesetzt?
    if (childItem.parent.label === 'Referenz Rollen' && childItem.label !== 'Rollenindex') {
      // "Rollenindex" Spezialfall
      mergedChildren = await getReferenceRoles(childItem.parent);
      console.log('Referenz Rollen', mergedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Tailoring' && childItem.label === 'Vorgehensbausteine') {
      addedChildren = await getTailoringProcessBuildingBlocks(childItem);
      console.log('Referenz Tailoring -> Vorgehensbausteine', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Tailoring' && childItem.label === 'Projekttypen und Projekttypvarianten') {
      addedChildren = await getProductTypesAndProductTypeVariants(childItem);
      console.log('Referenz Tailoring -> Projekttypen und Projekttypvarianten', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Abläufe' && childItem.label === 'Projektdurchführungsstrategien') {
      addedChildren = await getProjectExecutionStrategies(childItem);
      console.log('Referenz Tailoring -> Projektdurchführungsstrategien', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Tailoring' && childItem.label === 'Projektmerkmale') {
      addedChildren = await getProjectCharacteristics(childItem);
      console.log('Referenz Tailoring -> Projektmerkmale', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Arbeitshilfen' && childItem.label === 'Aktivitäten') {
      addedChildren = await getWorkAidsActivities(childItem);
      console.log('Referenz Arbeitshilfen -> Aktivitäten', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Methoden und Werkzeuge' && childItem.label === 'Methodenreferenzen') {
      addedChildren = await getWorkAidsMethodReferences(childItem);
      console.log('Referenz Arbeitshilfen -> Methodenreferenzen', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Methoden und Werkzeuge' && childItem.label === 'Werkzeugreferenzen') {
      addedChildren = await getWorkAidsToolReferences(childItem);
      console.log('Referenz Arbeitshilfen -> Werkzeugreferenzen', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Abläufe' && childItem.label === 'Entscheidungspunkte') {
      addedChildren = await getDecisionPoints(childItem);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Abläufe' && childItem.label === 'Ablaufbausteine') {
      addedChildren = await getProcessModules(childItem);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Produktvorlagen' && childItem.label === 'Übersicht über Produktvorlagen') {
      addedChildren = await getTemplates(childItem);
    }

    // const sections: Section[] = jsonDataFromXml.getElementsByTagName('Kapitel').map((section: any) => {
    //   return section.attributes as Section;
    // });

    return {
      text: textPart,
      generatedContent: generatedContent,
      wirdErsetzt: wirdErsetzt,
      // generierterInhaltErsetzend: generierterInhaltErsetzend,
      replacedContent: replacedContent,
      mergedChildren: mergedChildren,
      addedChildren: addedChildren,
      indexItem: indexItem,
    };
    // setSectionsDetailsData(xmlDataWithParent);
  }

  async function fetchData(): Promise<void> {
    const sectionUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' + modelVariantId + '/Kapitel/';

    const jsonDataFromXml: any = await getJsonDataFromXml(sectionUrl);

    // console.log("jsonDataFromXml.getElementsByTagName('Kapitel')", jsonDataFromXml.getElementsByTagName('Kapitel'));

    const result: NavMenuItem[] = []; // TODO: xmlDataWithParent

    const xmlDataWithParent = await addParentRecursive([jsonDataFromXml], result);
    console.log('xmlDataWithParent', xmlDataWithParent);

    // const sections: Section[] = jsonDataFromXml.getElementsByTagName('Kapitel').map((section: any) => {
    //   return section.attributes as Section;
    // });

    // setSectionsData(xmlDataWithParent);
    setNavigationData(xmlDataWithParent);
  }

  async function getReferenceProducts(target: any): Promise<NavMenuItem[]> {
    console.log('getReferenceProducts', target);
    const referenceProductsUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Disziplin?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(referenceProductsUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml.getElementsByTagName('Disziplin').map((disciplineValue: any) => {
      const disciplineEntry: NavMenuItem = {
        key: disciplineValue.attributes.id,
        parent: target,
        label: disciplineValue.attributes.name,
        dataType: NavTypeEnum.DISCIPLINE,
        onTitleClick: (item: any) => handleSelectedItem(item.key),
      };

      const products: NavMenuItem[] = disciplineValue
        .getElementsByTagName('Produkt')
        .map((productValue: any): NavMenuItem => {
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

    return navigation;
  }

  async function getReferenceRoles(target: any): Promise<NavMenuItem[]> {
    const referenceRolesUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Rollenkategorie?' +
      getProjectFeaturesString();

    // console.log(urlReferenceRolls);

    const jsonDataFromXml: any = await getJsonDataFromXml(referenceRolesUrl);

    const rolesNavigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Rollenkategorie')
      .map((roleCategoryValue: any) => {
        // in Kapitel the role entries are named "Projektrollen", "Organisationsrollen" and "Projektteamrollen"
        // in Rollenkategorie they are named im singular "Projektrolle", "Organisationsrolle" and "Projektteamrolle"
        const roleCategoryName = roleCategoryValue.attributes.name;
        const roleCategoryNavItem = target.children.find(
          (child: any) => child.attributes.titel.includes(roleCategoryName) // TODO: hier macht es Probleme, dass einige Einträge schon keine attributes.titel mehr haben... besser wir ändern nicht das ursprüngliche Object
        );

        const roleCategoryEntry: NavMenuItem = {
          key: roleCategoryNavItem.attributes.id, // roleCategory has no id
          parent: target,
          label: roleCategoryNavItem.attributes.titel,
          onTitleClick: (item: any) => handleSelectedItem(item.key),
        };

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
            console.log('bliblablub', roleValue);
            return {
              key: roleValue.attributes.id,
              parent: roleCategoryEntry,
              label: roleValue.attributes.name,
              dataType: navTypeRole,
              onClick: (item: any) => handleSelectedItem(item.key), // TODO: different Types
            };
          });
        console.log('roles', roles);

        roleCategoryEntry.children = roles;

        return roleCategoryEntry;
      });

    return rolesNavigation;
  }

  async function getDecisionPoints(target: any): Promise<NavMenuItem[]> {
    const decisionPointsUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Entscheidungspunkt?' +
      getProjectFeaturesString();

    // console.log(urlReferenceProcesses);

    const jsonDataFromXml: any = await getJsonDataFromXml(decisionPointsUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Entscheidungspunkt')
      .map((decisionPointValue) => {
        return {
          key: decisionPointValue.attributes.id,
          parent: target,
          label: decisionPointValue.attributes.name,
          dataType: NavTypeEnum.DECISION_POINT,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });
    return navigation;
  }

  async function getProcessModules(target: any): Promise<NavMenuItem[]> {
    const processModulesUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Ablaufbaustein?' +
      getProjectFeaturesString();

    // console.log(urlReferenceProcesses);

    const jsonDataFromXml: any = await getJsonDataFromXml(processModulesUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Ablaufbaustein')
      .map((processModuleValue) => {
        return {
          key: processModuleValue.attributes.id,
          parent: target,
          label: processModuleValue.attributes.name,
          dataType: NavTypeEnum.PROCESS_MODULE,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });
    return navigation;
  }

  async function getTailoringProcessBuildingBlocks(target: any): Promise<NavMenuItem[]> {
    const tailoringProcessBuildingBlocksUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Vorgehensbaustein?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(tailoringProcessBuildingBlocksUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Vorgehensbaustein')
      .map((processBuildingBlockValue: any) => {
        return {
          key: processBuildingBlockValue.attributes.id,
          parent: target,
          label: processBuildingBlockValue.attributes.name,
          dataType: NavTypeEnum.PROCESS_BUILDING_BLOCK,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });

    return navigation;
  }

  async function getWorkAidsActivities(target: any): Promise<NavMenuItem[]> {
    const workAidsActivitiesUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/Aktivitaet?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(workAidsActivitiesUrl);

    const disciplineEntriesMap = new Map<string, NavMenuItem>();

    jsonDataFromXml.getElementsByTagName('Aktivität').map((activityReference: any) => {
      const productRef = activityReference.getElementsByTagName('ProduktRef')[0];

      if (!disciplineEntriesMap.get(productToDisciplineMap.get(productRef.attributes.id)!.key)) {
        disciplineEntriesMap.set(productToDisciplineMap.get(productRef.attributes.id)!.key, {
          key: 'ACTIVITY_DISCIPLINE_' + productToDisciplineMap.get(productRef.attributes.id)!.key, // TODO: check !
          parent: target,
          children: [],
          label: productToDisciplineMap.get(productRef.attributes.id)!.title, // TODO: check !
          dataType: NavTypeEnum.ACTIVITY_DISCIPLINE,
          onTitleClick: (item: any) => handleSelectedItem(item.key),
        });
      }

      const product = {
        key: activityReference.attributes.id,
        parent: disciplineEntriesMap.get(productToDisciplineMap.get(productRef.attributes.id)!.key), //disciplineEntry,
        label: activityReference.attributes.name,
        dataType: NavTypeEnum.ACTIVITY,
        onClick: (item: any) => handleSelectedItem(item.key),
      };

      disciplineEntriesMap.get(productToDisciplineMap.get(productRef.attributes.id)!.key)!.children.push(product);
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

  async function getWorkAidsMethodReferences(target: any): Promise<NavMenuItem[]> {
    const workAidsMethodReferencesUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Methodenreferenz';

    const jsonDataFromXml: any = await getJsonDataFromXml(workAidsMethodReferencesUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Methodenreferenz')
      .map((methodReference: any) => {
        return {
          key: methodReference.attributes.id,
          parent: target,
          label: methodReference.attributes.name,
          dataType: NavTypeEnum.METHOD_REFERENCE,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });

    return navigation;
  }

  async function getWorkAidsToolReferences(target: any): Promise<NavMenuItem[]> {
    const workAidsToolReferencesUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Werkzeugreferenz';

    const jsonDataFromXml: any = await getJsonDataFromXml(workAidsToolReferencesUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Werkzeugreferenz')
      .map((toolReference: any) => {
        return {
          key: toolReference.attributes.id,
          parent: target,
          label: toolReference.attributes.name,
          dataType: NavTypeEnum.TOOL_REFERENCE,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });

    return navigation;
  }

  async function getTemplates(target: any): Promise<NavMenuItem[]> {
    const templatesUrl =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId +
      '/Projekttypvariante/' +
      projectTypeVariantId +
      '/ExterneKopiervorlage?' +
      getProjectFeaturesString();

    const jsonDataFromXml: any = await getJsonDataFromXml(templatesUrl);

    const disciplineEntriesMap = new Map<string, NavMenuItem>();

    jsonDataFromXml.getElementsByTagName('ExterneKopiervorlage').map((externalMasterTemplate: any) => {
      const productRef = externalMasterTemplate.getElementsByTagName('ProduktRef')[0];

      if (!disciplineEntriesMap.get(productToDisciplineMap.get(productRef.attributes.id)!.key)) {
        disciplineEntriesMap.set(productToDisciplineMap.get(productRef.attributes.id)!.key, {
          key: 'td_' + productToDisciplineMap.get(productRef.attributes.id)!.key, // TODO: check !
          parent: target,
          label: productToDisciplineMap.get(productRef.attributes.id)!.title, // TODO: check !
          dataType: NavTypeEnum.TEMPLATE_DISCIPLINE,
          onClick: (item: any) => handleSelectedItem(item.key),
        });
      }
    });

    const disciplineEntries = Array.from(disciplineEntriesMap.values());

    return disciplineEntries.sort(function (a, b) {
      return a.label < b.label ? -1 : 1;
    });
  }

  async function getProjectCharacteristics(target: any): Promise<NavMenuItem[]> {
    const projectCharacteristicsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' + modelVariantId + '/Projektmerkmal';

    const jsonDataFromXml: any = await getJsonDataFromXml(projectCharacteristicsUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Projektmerkmal')
      .map((projectCharacteristic: any) => {
        return {
          key: projectCharacteristic.attributes.id,
          parent: target,
          label: projectCharacteristic.attributes.name,
          dataType: NavTypeEnum.PROJECT_CHARACTERISTIC,
          onClick: (item: any) => handleSelectedItem(item.key),
        };
      });

    return navigation;
  }

  async function getProductTypesAndProductTypeVariants(target: any): Promise<NavMenuItem[]> {
    const projectTypeVariantsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttypvariante';

    const jsonDataFromXmlProjectTypeVariants: any = await getJsonDataFromXml(projectTypeVariantsUrl);

    const navigation: NavMenuItem[] = [];

    jsonDataFromXmlProjectTypeVariants
      .getElementsByTagName('Projekttypvariante')
      .map((projectTypeVariantValue: any) => {
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

  async function getProjectExecutionStrategies(target: any): Promise<NavMenuItem[]> {
    const projectTypeVariantsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttypvariante';

    const jsonDataFromXmlProjectTypeVariants: any = await getJsonDataFromXml(projectTypeVariantsUrl);

    const navigation: NavMenuItem[] = [];

    jsonDataFromXmlProjectTypeVariants
      .getElementsByTagName('Projekttypvariante')
      .map((projectTypeVariantValue: any) => {
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
      {navigationData.length > 0 && (
        <>
          <Sider
            collapsible
            collapsed={collapsed}
            collapsedWidth={50}
            onCollapse={() => {
              toggleCollapse();
              // this.forceUpdate();
            }}
            width={250}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'sticky',
              top: 0,
              left: 0,
            }}
          >
            <Menu
              // onClick={handleClick}
              mode="inline"
              inlineIndent={12}
              items={navigationData[0].children}
              selectedKeys={currentSelectedKeys}
              openKeys={openKeys} // TODO: funzt noch nicht
            />
            {/*<NavMenu data={sectionsData} />*/}
          </Sider>
        </>
      )}
    </>
  );
}
