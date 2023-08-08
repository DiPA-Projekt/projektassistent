import { Table, TableProps } from 'antd';
import parse from 'html-react-parser';
import React from 'react';
// import { TableEntry } from '@dipa-projekt/projektassistent-openapi';
import { fixLinksInText, getSearchStringFromHash } from '../../../../shares/utils';
import { DataTable } from './DataTable';
import { SubEntries } from './SubEntries';
import { useDocumentation } from '../../../../context/DocumentationContext';

export function PageEntryContent() {
  const { selectedPageEntry } = useDocumentation();

  const onChange: TableProps<any>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };
  console.log('PageEntryContent subPageEntries', selectedPageEntry);

  return (
    <div>
      {selectedPageEntry?.id ? (
        <>
          <div key={selectedPageEntry?.id}>
            <h2 id={selectedPageEntry?.id}> {selectedPageEntry?.header} </h2>
            {parse(fixLinksInText(selectedPageEntry?.descriptionText))}

            {selectedPageEntry.tableEntries.length > 0 && <DataTable data={selectedPageEntry.tableEntries} />}
            {selectedPageEntry?.dataSource && (
              <Table
                columns={selectedPageEntry?.columns}
                dataSource={selectedPageEntry?.dataSource}
                onRow={(record) => ({
                  id: record.key + getSearchStringFromHash(),
                })}
                pagination={false}
                onChange={onChange}
                scroll={{ y: '60vh' }} // TODO: schauen ob das so erwünscht ist
              />
            )}
          </div>
          <SubEntries data={selectedPageEntry} />
        </>
      ) : (
        <h2> Keine Seite ausgewählt </h2>
      )}
    </div>
  );
}
