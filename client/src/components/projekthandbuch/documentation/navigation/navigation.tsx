// import { Menu } from 'antd';
// import SubMenu from 'antd/es/menu/SubMenu';
import React, { useEffect, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { ShoppingOutlined } from '@ant-design/icons';
// import { withRouter } from 'react-router';
// import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { Layout, Menu } from 'antd';
import { getJsonDataFromXml } from '../../../../shares/utils';
// import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
// import SubMenu from 'antd/es/menu/SubMenu';
import { useDocumentation } from '../../../../context/DocumentationContext';

const { Sider } = Layout;

export enum NavTypeEnum {
  PRODUCT = 'product',
  DISCIPLINE = 'discipline',
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
  children: NavMenuItem[];
  dataType: NavTypeEnum;
  parentId: string; // TODO: rename to parentKey
}

interface MyType {
  [key: string]: string;
}

// @withRouter
export function Navigation() {
  const { setSelectedItemKey, /*sectionsData,*/ navigationData, setNavigationData } = useDocumentation();

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

  // setProjectFeatureIds(projectFeatureIdsSearchParam);
  // const [menuSectionData, setMenuSectionData] = useState<MenuEntry[]>([]);

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
        for (let child of item.children) {
          if (child.attributes?.id) {
            child.parentId = item.attributes.id;
            child.key = child.attributes.id;
            child.label = child.attributes.titel;
            child.onTitleClick = (item: any) => setSelectedItemKey(item.key);
            // console.log('child.attributes.id', child.attributes.id, child.attributes.titel, child.attributes);

            // setSelectedItemKey(child.attributes.id);

            const test = await fetchSectionDetailsData(child);
            if (test.replacedContent) {
              item.children = test.replacedContent;
              console.log('ersetze', test);
              child = test;
            }
            if (test.categoryIcon) {
              item.icon = test.categoryIcon;
            }
            // console.log(test);
            // if (child.attributes.GenerierterInhalt) {
            //   console.log('GenerierterInhalt', child.attributes.id, child.attributes.titel, child.attributes);
            // }
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
    let categoryIcon;

    // const xmlDataWithParent = addParentRecursive([jsonDataFromXml]);
    if (wirdErsetzt === 'Ja') {
      if (generatedContent === 'Elemente:Produkte_mit_Themen_nach_Disziplinen') {
        replacedContent = await getReferenceProducts(childItem.parentId);
        //// TODO
        categoryIcon = <ShoppingOutlined />;
      } else {
        console.log('muss noch ersetzt werden', jsonDataFromXml);
      }
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
      categoryIcon: categoryIcon,
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
    // console.log('xmlDataWithParent', xmlDataWithParent);

    // const sections: Section[] = jsonDataFromXml.getElementsByTagName('Kapitel').map((section: any) => {
    //   return section.attributes as Section;
    // });

    // setSectionsData(xmlDataWithParent);
    setNavigationData(xmlDataWithParent);
  }

  async function getReferenceProducts(targetKey: string): Promise<any[]> {
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

    const navigation: any[] = jsonDataFromXml.getElementsByTagName('Disziplin').map((disciplineValue: any) => {
      const products: any[] = disciplineValue.getElementsByTagName('Produkt').map((productValue: any): any => {
        return {
          key: productValue.attributes.id,
          parentId: disciplineValue.attributes.id,
          label: productValue.attributes.name,
          type: NavTypeEnum.PRODUCT,
          onTitleClick: (item: any) => setSelectedItemKey(item.key),
          // children: [],
        };
      });

      return {
        key: disciplineValue.attributes.id,
        parentId: targetKey,
        label: disciplineValue.attributes.name,
        type: NavTypeEnum.DISCIPLINE,
        onTitleClick: (item: any) => setSelectedItemKey(item.key),
        children: products,
      };
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
            <Menu mode="inline" items={navigationData[0].children} />
            {/*<NavMenu data={sectionsData} />*/}
          </Sider>
        </>
      )}
    </>
  );
}
