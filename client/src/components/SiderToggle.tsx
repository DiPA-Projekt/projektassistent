import React from 'react';
import { useDocumentation } from '../context/DocumentationContext';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

export function SiderToggle() {
  const { collapsed, setCollapsed } = useDocumentation();

  return (
    <>
      {/*{collapsed ? (*/}
      {/*  <MenuUnfoldOutlined className="trigger" onClick={() => setCollapsed(!collapsed)} />*/}
      {/*) : (*/}
      {/*  <MenuFoldOutlined className="trigger" onClick={() => setCollapsed(!collapsed)} />*/}
      {/*)}*/}
      <div>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: 'trigger',
          onClick: () => setCollapsed(!collapsed),
        })}
      </div>
    </>
  );
}
