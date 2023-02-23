import { Layout } from 'antd';
import React, { Component } from 'react';
import { Route, Routes } from 'react-router';
// import { Link } from 'react-router-dom';
import { ProjekthandbuchController } from './controller';
import { Documentation } from './documentation/documentation';
import { ProduktvorlagenComponent } from './produktvorlagen/component';
import { Project } from './projekt/project';

const { Content } = Layout;

// const breadcrumbNameMap: { [key: string]: string } = {
//   '/projekthandbuch': 'Projekthandbuch',
//   '/projekthandbuch/projekt': 'Tailoring',
//   '/projekthandbuch/dokumentation': 'Dokumentation',
// };

// function createBreadcrumbMap(menuItems: MenuEntry[]) {
//   menuItems.map((menuItem: MenuEntry) => {
//     const position = `/projekthandbuch/dokumentation/${menuItem.id}`;
//     breadcrumbNameMap[position] = menuItem.displayName;
//
//     if (menuItem.subMenuEntries?.length) {
//       createBreadcrumbMap(menuItem.subMenuEntries);
//     }
//   });
// }

// function setBreadcrumbNameMap() {
//   // const ctrl2: NavigationController = new NavigationController();
//   // createBreadcrumbMap(ctrl2.getMenuEntries());
// }

// const Breadcrumbs = withRouter((props) => {
//   const { location } = props;
//   const pathSnippets = location.pathname.split('/').filter((i) => i);
//
//   setBreadcrumbNameMap();
//
//   const breadcrumbItems = pathSnippets.map((_, index) => {
//     const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
//     const mappedName = breadcrumbNameMap[url];
//     if (mappedName !== null) {
//       return (
//         <Breadcrumb.Item key={url}>
//           <Link to={url}>{breadcrumbNameMap[url]}</Link>
//         </Breadcrumb.Item>
//       );
//     } else {
//       return null;
//     }
//   });
//
//   return <Breadcrumb style={{ margin: '16px' }}>{breadcrumbItems}</Breadcrumb>;
// });

export class ProjekthandbuchComponent extends Component<unknown, ProjekthandbuchController> {
  // public readonly ctrl: ProjekthandbuchController = new ProjekthandbuchController();

  public render(): JSX.Element {
    return (
      <>
        {/*<Breadcrumbs />*/}
        <Content style={{ margin: '0 16px' }}>
          <Routes>
            {/*<Redirect exact path="/projekthandbuch" to="/projekthandbuch/projekt" />*/}
            <Route path="/projekthandbuch/projekt" element={<Project />} />
            {/*<Redirect exact path="/projekthandbuch/dokumentation" to="/projekthandbuch/dokumentation/1" />*/}
            <Route path="/projekthandbuch/dokumentation/:id" element={<Documentation />} />
            <Route path="/produktvorlagen" element={<ProduktvorlagenComponent />} />
          </Routes>
        </Content>
      </>
    );
  }
}
