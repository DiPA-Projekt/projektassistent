// import { DataEntry } from '@dipa-projekt/projektassistent-openapi';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import React from 'react';
import { fixLinksInText, getSearchStringFromHash } from '../../../../shares/utils';
import { DataEntry } from '../Documentation';

export function TableEntriesList(props: { inputData: DataEntry[] }) {
  const entries: JSX.Element[] = [];

  props.inputData.map((entryItem: DataEntry) => {
    if (Array.isArray(entryItem)) {
      for (const entrySubItem of entryItem) {
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

        entrySubItem.dataEntries.map((innerEntryItem: DataEntry) => {
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
            entries.push(<span style={{ marginRight: '20px' }}>{parse(fixLinksInText(innerEntryItem.title))}</span>);
          }
        });
      }
    } else {
      if (entryItem?.id) {
        entries.push(
          <span style={{ marginRight: '20px', display: 'inline-flex' }} key={`table-item-${entryItem.id}`}>
            <Link to={`/documentation/${entryItem.id}${getSearchStringFromHash()}`}>{entryItem.title}</Link>
            {entryItem.suffix && <span style={{ marginLeft: '5px' }}>{entryItem.suffix}</span>}
          </span>
        );
      } else {
        entries.push(<span style={{ marginRight: '20px' }}>{parse(fixLinksInText(entryItem.title))}</span>);
      }
    }
  });
  return <>{entries}</>;
}
