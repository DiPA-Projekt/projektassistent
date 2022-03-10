import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { TeamOutlined } from '@ant-design/icons';
import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { RolesNavigationController } from './controller';
import { Subscription } from 'rxjs';
import { withRouter } from 'react-router';

function renderIcon(param: string | undefined) {
  switch (param) {
    case 'team':
      return <TeamOutlined />;
    default:
      return '';
  }
}

function RenderMenuItem(menuItems: MenuEntry[], depth: number): JSX.Element {
  // const history = useHistory();
  // // const menuItems: MenuEntry[] = ctrl.getMenuEntries();
  //
  // const handleTitleClick = (event: { key: string; domEvent: Event }) => {
  //   history.push(`./${event.key}`);
  //   console.log('handleTitleClick', event.key, event.domEvent);
  // };

  return (
    <>
      {menuItems.map((menuItem: MenuEntry) => {
        if (menuItem.subMenuEntries && menuItem.subMenuEntries.length > 0) {
          return (
            <SubMenu
              // onClick={() => setData(menuItem)}
              // onTitleClick={handleTitleClick}
              key={menuItem.id.toString()}
              title={menuItem.displayName}
              icon={renderIcon(menuItem.displayIcon)}
            >
              {RenderMenuItem(menuItem.subMenuEntries, depth + 1)}
            </SubMenu>
          );
        } else {
          return (
            <Menu.Item key={menuItem.id.toString()} icon={renderIcon(menuItem.displayIcon)}>
              <Link to={`./${menuItem.id}`}>{menuItem.displayName}</Link>
            </Menu.Item>
          );
        }
      })}
    </>
  );
}

@withRouter
export class RolesNavigationComponent
  extends ReactComponent<unknown, RolesNavigationController>
  implements GenericComponent
{
  public ctrl: RolesNavigationController = new RolesNavigationController();

  private navigationSubscription: Subscription = new Subscription();

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new RolesNavigationController(this.forceUpdate.bind(this));
  }

  public componentDidMount(): void {
    this.ctrl.onInit();

    this.navigationSubscription = this.ctrl.projekthandbuchService.getNavigationData().subscribe((navigation: any) => {
      this.setState({ navigation: navigation });

      // this.render();
    });
  }

  public componentWillUnmount(): void {
    this.navigationSubscription.unsubscribe();

    this.ctrl.onDestroy();
  }

  public componentDidUpdate(prevProps): void {
    // const { id } = useParams<{ id: string }>();
    // const id = '1';
    if (this.props.location !== prevProps.location) {
      this.ctrl.onRouteChanged(this.props.match.params.id);
    }
  }

  public render(): JSX.Element {
    // const { navigation } = this.ctrl.state;
    return (
      <>
        {this.ctrl.menuEntries.length > 0 && (
          <>
            {RenderMenuItem(this.ctrl.getMenuEntries(), 0)}
            {/*<NavMenu ctrl={this.ctrl} />*/}
          </>
        )}
      </>
    );
  }
}
