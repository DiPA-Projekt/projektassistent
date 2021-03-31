import { Breadcrumb, Layout } from 'antd';
import React from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProjekthandbuchController } from './controller';
import { ProjektComponent } from './projekt/component';
import { DocumentationComponent } from './documentation/component';
import { Link } from 'react-router-dom';
import { NavigationController } from './documentation/navigation/controller';
import { MenuEntry } from '../../../openapi';

const { Content } = Layout;

const breadcrumbNameMap: { [key: string]: string } = {
  '/projekthandbuch': 'Projekthandbuch',
  '/projekthandbuch/projekt': 'Tailoring',
  '/projekthandbuch/dokumentation': 'Dokumentation',
};

function createBreadcrumbMap(menuItems: MenuEntry[]) {
  menuItems.map((menuItem: MenuEntry) => {
    const position = `/projekthandbuch/dokumentation/${menuItem.id}`;
    breadcrumbNameMap[position] = menuItem.displayName;

    if (menuItem.subMenuEntries?.length) {
      createBreadcrumbMap(menuItem.subMenuEntries);
    }
  });
}

function setBreadcrumbNameMap() {
  const ctrl2: NavigationController = new NavigationController();
  createBreadcrumbMap(ctrl2.getMenuEntries());
}

const Breadcrumbs = withRouter((props) => {
  const { location } = props;
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  setBreadcrumbNameMap();

  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const mappedName = breadcrumbNameMap[url];
    if (mappedName !== null) {
      return (
        <Breadcrumb.Item key={url}>
          <Link to={url}>{breadcrumbNameMap[url]}</Link>
        </Breadcrumb.Item>
      );
    } else {
      return null;
    }
  });

  return <Breadcrumb style={{ margin: '16px' }}>{breadcrumbItems}</Breadcrumb>;
});

export class ProjekthandbuchComponent
  extends ReactComponent<unknown, ProjekthandbuchController>
  implements GenericComponent {
  public readonly ctrl: ProjekthandbuchController = new ProjekthandbuchController();

  public render(): JSX.Element {
    return (
      <>
        <Breadcrumbs />
        <Content style={{ margin: '0 16px' }}>
          <Switch>
            <Redirect exact path="/projekthandbuch" to="/projekthandbuch/projekt" />
            <Route exact path="/projekthandbuch/projekt">
              <ProjektComponent />
            </Route>
            <Redirect exact path="/projekthandbuch/dokumentation" to="/projekthandbuch/dokumentation/1" />
            <Route path="/projekthandbuch/dokumentation/:id" component={DocumentationComponent}></Route>
          </Switch>
        </Content>
      </>
    );
  }
}
