import { Anchor } from 'antd';
import React from 'react';

import { MenuEntry } from '../../../../../openapi';
import { menuEntryFound } from '../content/component';

const handleClick = (e: MouseEvent) => {
  e.preventDefault();
};

export function AnchorList(): JSX.Element {
  return (
    <Anchor affix={false} onClick={(e) => handleClick(e.nativeEvent)}>
      <h3 style={{ paddingLeft: '16px' }}>Seitenübersicht</h3>
      <Anchor.Link href={`#${menuEntryFound?.menuEntry?.id}`} title={menuEntryFound?.menuEntry?.displayName}>
        {menuEntryFound?.depth >= 3 &&
          menuEntryFound.menuEntry.subMenuEntries?.map((productChild: MenuEntry) => {
            return (
              <Anchor.Link
                key={productChild.id.toString()}
                href={`#${productChild.id}`}
                title={productChild.displayName}
              />
            );
          })}
      </Anchor.Link>
    </Anchor>
  );
}
