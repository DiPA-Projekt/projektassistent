import { Anchor } from 'antd';
import React from 'react';

import { PageEntry } from '@dipa-projekt/projektassistent-openapi';
import { pageEntryFound } from '../content/component';

const handleClick = (e: MouseEvent) => {
  e.preventDefault();
};

export function AnchorList(): JSX.Element {
  return (
    <Anchor affix={false} onClick={(e) => handleClick(e.nativeEvent)}>
      <h3 style={{ paddingLeft: '16px' }}>Seitenübersicht</h3>
      <>
        {pageEntryFound && (
          <Anchor.Link href={`#${pageEntryFound?.id}`} title={pageEntryFound?.header}>
            {pageEntryFound.subPageEntries?.map((productChild: PageEntry) => {
              return <Anchor.Link key={productChild.id} href={`#${productChild.id}`} title={productChild.header} />;
            })}
          </Anchor.Link>
        )}
      </>
    </Anchor>
  );
}
