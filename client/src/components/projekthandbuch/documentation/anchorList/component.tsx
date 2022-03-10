import { Anchor } from 'antd';
import React from 'react';

import { MenuEntry } from '@dipa-projekt/projektassistent-openapi';

import { menuEntryFound } from '../content/component';

const handleClick = (e: MouseEvent) => {
  e.preventDefault();
};

export function AnchorList(): JSX.Element {
  return (
    <Anchor affix={false} onClick={(e) => handleClick(e.nativeEvent)}>
      <h3 style={{ paddingLeft: '16px' }}>Seitenübersicht</h3>
      <>
        {menuEntryFound && (
          <Anchor.Link href={`#${menuEntryFound?.menuEntry?.id}`} title={menuEntryFound?.menuEntry?.displayName}>
            {menuEntryFound.subPageEntries?.map((productChild: MenuEntry) => {
              return (
                <Anchor.Link
                  key={productChild.menuEntryId.toString()}
                  href={`#${productChild.menuEntryId}`}
                  title={productChild.displayName}
                />
              );
            })}
          </Anchor.Link>
        )}
      </>
    </Anchor>
  );
}
