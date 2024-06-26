// import { DataEntry } from '@dipa-projekt/projektassistent-openapi';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import React from 'react';
import { fixLinksInText, getSearchStringFromHash } from '../../../../shares/utils';
import { DataEntry } from '../Documentation';

export function TableEntriesList(props: { inputData: DataEntry[] }) {
  const entries: JSX.Element[] = [];

  props.inputData.map((entryItem: DataEntry, entryItemIndex: number) => {
    if (Array.isArray(entryItem)) {
      for (const entrySubItem of entryItem) {
        entries.push(
          <div key={`table-sub-header-entry-description-${entrySubItem.subheader.id}`}>
            {entrySubItem?.dataEntryDescription ? <div>{parse(entrySubItem.dataEntryDescription)}</div> : ''}
          </div>
        );

        entries.push(
          <span style={{ fontWeight: 'bold', display: 'block' }} key={`table-sub-header-${entrySubItem.subheader.id}`}>
            {entrySubItem.subheader?.isLink ? (
              <Link to={`/documentation/${entrySubItem.subheader.id}${getSearchStringFromHash()}`}>
                {entrySubItem.subheader.title}
              </Link>
            ) : (
              entrySubItem.subheader.title
            )}
          </span>
        );

        entrySubItem.dataEntries.map((innerEntryItem: DataEntry, innerEntryItemIndex: number) => {
          if (innerEntryItem?.id) {
            entries.push(
              <span style={{ marginRight: '20px', display: 'inline-flex' }} key={`table-item-${innerEntryItem.id}`}>
                <Link to={`/documentation/${innerEntryItem.id}${getSearchStringFromHash()}`}>
                  {innerEntryItem.title}
                </Link>
                {innerEntryItem.suffix && <span style={{ marginLeft: '5px' }}>{innerEntryItem.suffix}</span>}
              </span>
            );
          } else {
            entries.push(
              <span style={{ marginRight: '20px' }} key={`table-item-entrySubItem-${innerEntryItemIndex}`}>
                <span style={{ color: '#333' }}>{parse(fixLinksInText(innerEntryItem.title))}</span>
                {innerEntryItem.suffix && <span style={{ marginLeft: '5px' }}>{innerEntryItem.suffix}</span>}
              </span>
            );
          }
        });
      }
    } else {
      if (entryItem?.id) {
        entries.push(
          <span style={{ marginRight: '20px', display: 'inline-flex' }} key={`table-item-entryItem-${entryItem.id}`}>
            <Link to={`/documentation/${entryItem.id}${getSearchStringFromHash()}`}>{entryItem.title}</Link>
            {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
          </span>
        );
      } else {
        entries.push(
          <span style={{ marginRight: '20px' }} key={`table-item-entryItem-${entryItemIndex}`}>
            <span style={{ color: '#333' }}>{parse(fixLinksInText(entryItem.title))}</span>
            {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
          </span>
        );
      }
    }
  });
  return <>{entries}</>;
}
