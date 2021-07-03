import { Layout, Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

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
import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { NavigationController } from './controller';

const { Sider } = Layout;

const OPEN_KEYS: React.Key[] = [];
// submenu keys of first level
const rootSubmenuKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];

function renderIcon(param: string | undefined) {
  switch (param) {
    case 'home':
      return <HomeOutlined />;
    case 'file-protect':
      return <FileProtectOutlined />;
    case 'shopping':
      return <ShoppingOutlined />;
    case 'team':
      return <TeamOutlined />;
    case 'ordered-list':
      return <OrderedListOutlined />;
    case 'scissor':
      return <ScissorOutlined />;
    case 'tool':
      return <ToolOutlined />;
    case 'paperclip':
      return <PaperClipOutlined />;
    default:
      return '';
  }
}

function RenderMenuItem(menuItems: MenuEntry[], depth: number): JSX.Element {
  const history = useHistory();
  const handleTitleClick = (event: { key: string; domEvent: Event }) => {
    history.push(`./${event.key}`);
  };

  return (
    <>
      {menuItems.map((menuItem: MenuEntry) => {
        if (depth < 3 && menuItem.subMenuEntries && menuItem.subMenuEntries.length > 0) {
          return (
            <SubMenu
              onTitleClick={handleTitleClick}
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

function NavMenu(props: { ctrl: NavigationController }): JSX.Element {
  const [openKeys, setOpenKeys] = useState(OPEN_KEYS);
  const onOpenChange = (keys: React.Key[]) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey.toString()) > -1) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  };

  return (
    <Menu
      inlineIndent={12}
      mode="inline"
      theme="dark"
      openKeys={openKeys as string[]}
      onOpenChange={onOpenChange}
      // defaultSelectedKeys={['36']}
      // defaultOpenKeys={['3', '15', '18']}
      style={{ height: '100%' }}
    >
      {RenderMenuItem(props.ctrl.getMenuEntries(), 0)}
    </Menu>
  );
}

export class NavigationComponent extends ReactComponent<unknown, NavigationController> implements GenericComponent {
  public ctrl: NavigationController = new NavigationController();

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new NavigationController(this.forceUpdate.bind(this));
  }

  public componentWillMount(): void {
    this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    return (
      <>
        {this.ctrl.menuEntries.length > 0 && (
          <>
            <Sider
              collapsible
              collapsed={this.ctrl.collapsed}
              collapsedWidth={50}
              onCollapse={() => {
                this.ctrl.toggleCollapse();
                this.forceUpdate();
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
              <NavMenu ctrl={this.ctrl} />
            </Sider>
          </>
        )}
      </>
    );
  }
}
