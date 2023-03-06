// import { Menu } from 'antd';
// import SubMenu from 'antd/es/menu/SubMenu';
import React, { useEffect, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { OrderedListOutlined, ScissorOutlined, ShoppingOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
// import { withRouter } from 'react-router';
// import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { Layout, Menu } from 'antd';
import { getJsonDataFromXml, getMenuItemByAttributeValue } from '../../../../shares/utils';
// import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
// import SubMenu from 'antd/es/menu/SubMenu';
import { useDocumentation } from '../../../../context/DocumentationContext';

import 'antd/dist/reset.css';

const { Sider } = Layout;

export enum NavTypeEnum {
  PRODUCT = 'product',
  DISCIPLINE = 'discipline',
  ROLE = 'role',
  DECISION_POINT = 'decisionPoint',
  PROCESS_MODULE = 'processModule',
  PROCESS_BUILDING_BLOCK = 'processBuildingBlock',
  ACTIVITY = 'activity',
  METHOD_REFERENCE = 'methodReference',
  TOOL_REFERENCE = 'toolReference',
  PROJECT_TYPE_VARIANT = 'projectTypeVaraint',
  PROJECT_TYPE = 'projectType',
  PROJECT_CHARACTERISTIC = 'projectCharacteristic',
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
//
// const OPEN_KEYS: React.Key[] = [];
// // submenu keys of first level
// const rootSubmenuKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];

// function renderIcon(param: string | undefined) {
//   switch (param) {
//     case 'home':
//       return <HomeOutlined />;
//     case 'file-protect':
//       return <FileProtectOutlined />;
//     case 'shopping':
//       return <ShoppingOutlined />;
//     case 'team':
//       return <TeamOutlined />;
//     case 'ordered-list':
//       return <OrderedListOutlined />;
//     case 'scissor':
//       return <ScissorOutlined />;
//     case 'tool':
//       return <ToolOutlined />;
//     case 'paperclip':
//       return <PaperClipOutlined />;
//     default:
//       return '';
//   }
// }

// function RenderMenuItem(menuItems: MenuEntry[], depth: number): JSX.Element {
//   const navigate = useNavigate();
//   const handleTitleClick = (e: {
//     key: string;
//     domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
//   }) => {
//     navigate(`./${e.key}`);
//   };
//
//   return (
//     <>
//       {menuItems.map((menuItem: MenuEntry) => {
//         if (depth < 3 && menuItem.subMenuEntries && menuItem.subMenuEntries.length > 0) {
//           return (
//             <SubMenu
//               onTitleClick={handleTitleClick}
//               key={menuItem.id.toString()}
//               title={menuItem.displayName}
//               icon={renderIcon(menuItem.displayIcon)}
//             >
//               {RenderMenuItem(menuItem.subMenuEntries, depth + 1)}
//             </SubMenu>
//           );
//         } else {
//           return (
//             <Menu.Item key={menuItem.id.toString()} icon={renderIcon(menuItem.displayIcon)}>
//               <Link to={`./${menuItem.id}`}>{menuItem.displayName}</Link>
//             </Menu.Item>
//           );
//         }
//       })}
//     </>
//   );
// }

// function NavMenu(data: any): JSX.Element {
//   // const [openKeys, setOpenKeys] = useState(OPEN_KEYS);
//   // const onOpenChange = (keys: React.Key[]) => {
//   //   const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
//   //   if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey.toString()) > -1) {
//   //     setOpenKeys([latestOpenKey]);
//   //   } else {
//   //     setOpenKeys(keys);
//   //   }
//   // };
//
//   return (
//     <Menu
//       inlineIndent={12}
//       mode="inline"
//       theme="dark"
//       // openKeys={openKeys as string[]}
//       // onOpenChange={onOpenChange}
//       // defaultSelectedKeys={['36']}
//       // defaultOpenKeys={['3', '15', '18']}
//       style={{ height: '100%' }}
//     >
//       {RenderMenuItem(data, 0)}
//     </Menu>
//   );
// }

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
  // onClick?: Function;
  children?: NavMenuItem[];
  dataType?: NavTypeEnum;
  parentId: string; // TODO: rename to parentKey
}

interface MyType {
  [key: string]: string;
}

// @withRouter
export function Navigation() {
  const { setSelectedItemKey, setSelectedIndexType, /*sectionsData,*/ navigationData, setNavigationData } =
    useDocumentation();

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

  // const location = useLocation();
  //
  // useEffect(() => {
  //   console.log('pathname', location.pathname);
  // }, [location]);
  //
  // const [current, setCurrent] = useState(location.pathname);
  // setProjectFeatureIds(projectFeatureIdsSearchParam);
  // const [menuSectionData, setMenuSectionData] = useState<MenuEntry[]>([]);

  // useEffect(() => {
  //   if (location) {
  //     if (current !== location.pathname) {
  //       setCurrent(location.pathname);
  //     }
  //   }
  // }, [location, current]);
  //
  // function handleClick(e: any) {
  //   setCurrent(e.key);
  // }

  useEffect(() => {
    async function mount() {
      await fetchData();
    }

    mount().then();
    //eslint-disable-next-line
  }, [modelVariantId]);

  // public ctrl: NavigationController = new NavigationController();

  // private navigationSubscription: Subscription = new Subscription();

  // public componentDidMount(): void {
  //   // this.ctrl.getData().then(() => {
  //   //   // this.ctrl.getMenuEntries();
  //   //   console.log('componentDidMount', this.ctrl.getMenuEntries());
  //   //
  //   //   // TODO: schöner
  //   //   this.navigationSubscription = this.ctrl.projekthandbuchService
  //   //     .getNavigationData()
  //   //     .subscribe((navigation: any) => {
  //   //       this.setState({ navigation: navigation });
  //   //
  //   //       // this.render();
  //   //     });
  //   // });
  // }
  //
  // public componentWillUnmount(): void {
  //   this.navigationSubscription.unsubscribe();
  //   // this.ctrl.onDestroy();
  // }

  // public componentDidUpdate(prevProps: { location: any }): void {
  //   // if (this.props.location !== prevProps.location) {
  //   //   this.ctrl.onRouteChanged(this.props.match.params.id);
  //   // }
  // }

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

  async function addParentRecursive(items: any[]) {
    for (const item of items) {
      if (item.children) {
        console.log('item', item);

        let currentGeneratedChildren: NavMenuItem[] = [];

        let i = 0;
        for (let child of item.children) {
          // TODO: cleanup
          if (child.name !== 'Kapitel') {
            // const removed = item.children.splice(i, 1);
            // console.log('removed', removed);
            // delete item.children[i];
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
              child.parentId = item.attributes.id;
              child.parent = item;
              if (!child.parentId) {
                console.log('child.parentId null', item);
              }
              child.key = child.attributes.id;
              //child.label = <Link to={child.attributes.id}>{child.attributes.titel}</Link>;
              child.label = child.attributes.titel;
              child.onTitleClick = (item: any) => setSelectedItemKey(item.key);
              // console.log('child.attributes.id', child.attributes.id, child.attributes.titel, child.attributes);

              // setSelectedItemKey(child.attributes.id);

              const test = await fetchSectionDetailsData(child);
              if (test.replacedContent) {
                item.children = test.replacedContent;
                console.log('ersetze', test);
                child = test;
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

              if (test.categoryIcon) {
                item.icon = test.categoryIcon;
              }
              // console.log(test);
              // if (child.attributes.GenerierterInhalt) {
              //   console.log('GenerierterInhalt', child.attributes.id, child.attributes.titel, child.attributes);
              // }
            }
            i++;
          }
        }

        await addParentRecursive(item.children);
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
    let categoryIcon;

    // TODO: anders lösen
    let indexItem;

    // TODO: generatedContent = Elemente:Projektrollen
    // TODO: generatedContent = Elemente:Organisationsrollen
    // TODO: generatedContent = Elemente:Projektteamrollen

    // const xmlDataWithParent = addParentRecursive([jsonDataFromXml]);
    if (wirdErsetzt === 'Ja') {
      if (generatedContent === 'Elemente:Produkte_mit_Themen_nach_Disziplinen') {
        replacedContent = await getReferenceProducts(childItem.parent);
        //// TODO
        categoryIcon = <ShoppingOutlined />;
      } else {
        console.log('muss noch ersetzt werden', jsonDataFromXml);
      }
    }

    if (generatedContent) {
      switch (generatedContent) {
        case 'Index:Rollen': {
          indexItem = {
            key: childItem.attributes.id,
            parentId: childItem.parent.key, // roleCategory has no id
            label: childItem.attributes.titel,
            onClick: () => setSelectedIndexType(IndexTypeEnum.ROLE),
          };
        }
      }
    }

    // TODO: warum ist hier wirdErsetzt nicht gesetzt?
    if (childItem.parent.label === 'Referenz Rollen' && childItem.label !== 'Rollenindex') {
      // "Rollenindex" Spezialfall
      mergedChildren = await getReferenceRoles(childItem.parent);
      //// TODO
      categoryIcon = <TeamOutlined />;
      console.log('Referenz Rollen', mergedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Tailoring' && childItem.label === 'Vorgehensbausteine') {
      addedChildren = await getTailoringProcessBuildingBlocks(childItem);
      //// TODO
      categoryIcon = <ScissorOutlined />;
      console.log('Referenz Tailoring -> Vorgehensbausteine', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Tailoring' && childItem.label === 'Projekttypen und Projekttypvarianten') {
      addedChildren = await getProductTypesAndProductTypeVariants(childItem);
      //// TODO
      // categoryIcon = <ScissorOutlined />;
      console.log('Referenz Tailoring -> Projekttypen und Projekttypvarianten', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Tailoring' && childItem.label === 'Projektmerkmale') {
      addedChildren = await getProjectCharacteristics(childItem);
      //// TODO
      // categoryIcon = <ScissorOutlined />;
      console.log('Referenz Tailoring -> Projektmerkmale', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Arbeitshilfen' && childItem.label === 'Aktivitäten') {
      addedChildren = await getWorkAidsActivities(childItem);
      //// TODO
      categoryIcon = <ToolOutlined />;
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
      //// TODO
      categoryIcon = <OrderedListOutlined />;
      console.log('Referenz Abläufe -> Entscheidungspunkte', addedChildren);
    }

    // TODO: sollte direkt gehen, nicht unbedingt über die Referenz
    if (childItem.parent.label === 'Referenz Abläufe' && childItem.label === 'Ablaufbausteine') {
      addedChildren = await getProcessModules(childItem);
      //// TODO
      // categoryIcon = <ScissorOutlined />;
      console.log('Referenz Abläufe -> Ablaufbausteine', addedChildren);
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
      categoryIcon: categoryIcon,
      indexItem: indexItem,
    };
    // setSectionsDetailsData(xmlDataWithParent);
  }

  // function getSectionsDataFromXml(jsonDataFromXml: any, parentId: string): MenuEntry {
  //   // for (const currentJsonData of jsonDataFromXml) {
  //   //   console.log("name", currentJsonData.name);
  //   //   console.log("attributes", currentJsonData.attributes);
  //   //   console.log("value", currentJsonData.value);
  //
  //   if (jsonDataFromXml.children?.length === 0) {
  //     return {
  //       id: jsonDataFromXml.attributes.id,
  //       parentId: parentId,
  //       displayName: jsonDataFromXml.attributes.name,
  //     };
  //   } else {
  //     const childrenA = [];
  //
  //     for (const child of jsonDataFromXml.children) {
  //       childrenA.push({
  //         id: child.attributes.id,
  //         parentId: parentId,
  //         displayName: child.attributes.name,
  //         subMenuEntries: getSectionsDataFromXml(child.children, child.attributes.id),
  //       });
  //     }
  //
  //     return childrenA;
  //   }
  //   // }
  // }

  async function fetchData(): Promise<void> {
    const sectionUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' + modelVariantId + '/Kapitel/';

    const jsonDataFromXml: any = await getJsonDataFromXml(sectionUrl);

    // console.log("jsonDataFromXml.getElementsByTagName('Kapitel')", jsonDataFromXml.getElementsByTagName('Kapitel'));

    const xmlDataWithParent = await addParentRecursive([jsonDataFromXml]);
    console.log('xmlDataWithParent', xmlDataWithParent);

    // const sections: Section[] = jsonDataFromXml.getElementsByTagName('Kapitel').map((section: any) => {
    //   return section.attributes as Section;
    // });

    // setSectionsData(xmlDataWithParent);
    setNavigationData(xmlDataWithParent);
  }

  async function getReferenceProducts(target: any): Promise<NavMenuItem[]> {
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
      const products: NavMenuItem[] = disciplineValue
        .getElementsByTagName('Produkt')
        .map((productValue: any): NavMenuItem => {
          return {
            key: productValue.attributes.id,
            parentId: disciplineValue.attributes.id,
            label: productValue.attributes.name,
            dataType: NavTypeEnum.PRODUCT,
            onClick: (item: any) => setSelectedItemKey(item.key), // TODO: different Types
            // children: [],
          };
        });

      return {
        key: disciplineValue.attributes.id,
        parentId: target.key,
        label: disciplineValue.attributes.name,
        dataType: NavTypeEnum.DISCIPLINE,
        onTitleClick: (item: any) => setSelectedItemKey(item.key),
        children: products,
      };
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

        const roles: NavMenuItem[] = roleCategoryValue
          .getElementsByTagName('RolleRef')
          .map((roleValue: any): NavMenuItem => {
            console.log('bliblablub', roleValue);
            return {
              key: roleValue.attributes.id,
              parentId: roleCategoryNavItem.attributes.id, // roleCategory has no id
              label: roleValue.attributes.name,
              dataType: NavTypeEnum.ROLE,
              onClick: (item: any) => setSelectedItemKey(item.key), // TODO: different Types
            };
          });
        console.log('roles', roles);

        return {
          key: roleCategoryNavItem.attributes.id, // roleCategory has no id
          parentId: target.key, // ???
          label: roleCategoryNavItem.attributes.titel,
          onTitleClick: (item: any) => setSelectedItemKey(item.key),
          children: roles,
        };
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
          parentId: target.key,
          label: decisionPointValue.attributes.name,
          dataType: NavTypeEnum.DECISION_POINT,
          onClick: (item: any) => setSelectedItemKey(item.key),
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
          parentId: target.key,
          label: processModuleValue.attributes.name,
          dataType: NavTypeEnum.PROCESS_MODULE,
          onClick: (item: any) => setSelectedItemKey(item.key),
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
          parentId: target.key,
          label: processBuildingBlockValue.attributes.name,
          dataType: NavTypeEnum.PROCESS_BUILDING_BLOCK,
          onClick: (item: any) => setSelectedItemKey(item.key),
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

    const navigation: NavMenuItem[] = jsonDataFromXml.getElementsByTagName('Aktivität').map((methodReference: any) => {
      return {
        key: methodReference.attributes.id,
        parentId: target.key,
        label: methodReference.attributes.name,
        dataType: NavTypeEnum.ACTIVITY,
        onClick: (item: any) => setSelectedItemKey(item.key),
      };
    });

    return navigation;
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
          parentId: target.key,
          label: methodReference.attributes.name,
          dataType: NavTypeEnum.METHOD_REFERENCE,
          onClick: (item: any) => setSelectedItemKey(item.key),
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
      .map((methodReference: any) => {
        return {
          key: methodReference.attributes.id,
          parentId: target.key,
          label: methodReference.attributes.name,
          dataType: NavTypeEnum.TOOL_REFERENCE,
          onClick: (item: any) => setSelectedItemKey(item.key),
        };
      });

    return navigation;
  }

  async function getProjectCharacteristics(target: any): Promise<NavMenuItem[]> {
    const projectCharacteristicsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' + modelVariantId + '/Projektmerkmal';

    const jsonDataFromXml: any = await getJsonDataFromXml(projectCharacteristicsUrl);

    const navigation: NavMenuItem[] = jsonDataFromXml
      .getElementsByTagName('Projektmerkmal')
      .map((methodReference: any) => {
        return {
          key: methodReference.attributes.id,
          parentId: target.key,
          label: methodReference.attributes.name,
          dataType: NavTypeEnum.PROJECT_CHARACTERISTIC,
          onClick: (item: any) => setSelectedItemKey(item.key),
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
            parentId: target.key,
            label: projectTypeValue.attributes.name,
            dataType: NavTypeEnum.PROJECT_TYPE,
            onTitleClick: (item: any) => setSelectedItemKey(item.key),
            children: [],
          };

          navigation.push(projectType);
        }

        projectType.children.push({
          key: projectTypeVariantValue.attributes.id,
          parentId: projectTypeValue.attributes.id,
          label: projectTypeVariantValue.attributes.name,
          dataType: NavTypeEnum.PROJECT_TYPE_VARIANT,
          onClick: (item: any) => setSelectedItemKey(item.key), // TODO: different Types
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
              // selectedKeys={[current]}
            />
            {/*<NavMenu data={sectionsData} />*/}
          </Sider>
        </>
      )}
    </>
  );
}
