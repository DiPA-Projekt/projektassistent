// import { DataEntry, TableEntry } from '@dipa-projekt/projektassistent-openapi';
import { Avatar, List } from 'antd';
import React from 'react';
import {
  FolderAddOutlined,
  LinkOutlined,
  MedicineBoxOutlined,
  NotificationOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { TableEntriesList } from './TableEntriesList';
import { TableEntry } from '../Documentation';

const icons: Map<string, { color: string; icon: JSX.Element }> = new Map<
  string,
  { color: string; icon: JSX.Element }
>();
// Referenz Produkte
icons.set('Verantwortlich', { color: '#87d068', icon: <UserOutlined /> });
icons.set('Mitwirkend', { color: '#ff7f36', icon: <TeamOutlined /> });
icons.set('Hilfsmittel', { color: '#689fd0', icon: <MedicineBoxOutlined /> });
icons.set('Teil von', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Besteht aus', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Produktumfang', { color: '#689fd0', icon: <MedicineBoxOutlined /> });
icons.set('Erzeugt', { color: '#689fd0', icon: <FolderAddOutlined /> });
icons.set('Erzeugt durch', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Inhaltlich abhängig', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Entscheidungsrelevant bei', { color: '#ffd442', icon: <NotificationOutlined /> });
icons.set('Sonstiges', { color: '#5f5f5f', icon: <TagsOutlined /> });
icons.set('Verantwortliche und Produkte', { color: '#5f5f5f', icon: <ShoppingOutlined /> }); // TODO

// Referenz Rollen
icons.set('Aufgaben und Befugnisse', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Fähigkeitsprofil', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Rollenbesetzung', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Verantwortlich für', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Wirkt mit bei', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
// Referenz Abläufe;
icons.set('Zugeordnete Produkte', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
icons.set('Ablaufbausteine', { color: '#e71937', icon: <PartitionOutlined rotate={180} /> });
// Referenz Tailoring
icons.set('Projektdurchführungsstrategie', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Projektmerkmale', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Ausgewählte Vorgehensbausteine', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Ausgewählte Ablaufbausteine', { color: '#689fd0', icon: <ToolOutlined /> });
// Referenz Arbeitshilfen
icons.set('Produkt', { color: '#689fd0', icon: <ShoppingOutlined /> });
icons.set('Produkte', { color: '#689fd0', icon: <ShoppingOutlined /> });
icons.set('Werkzeuge', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Arbeitsschritte', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Methoden', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Aktivitäten', { color: '#689fd0', icon: <ToolOutlined /> });
icons.set('Quellen', { color: '#689fd0', icon: <LinkOutlined /> });

export function DataTable(props: { data: TableEntry[] }) {
  function renderSwitch(param: string) {
    const icon = icons.get(param);
    return <Avatar style={{ backgroundColor: icon?.color }} icon={icon?.icon} />;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={props.data}
      renderItem={(item: TableEntry) => (
        <List.Item>
          <List.Item.Meta
            avatar={renderSwitch(item.descriptionEntry)}
            title={item.descriptionEntry}
            description={<TableEntriesList inputData={item?.dataEntries} />}
          />
        </List.Item>
      )}
      style={{ padding: '0 1rem' }}
    />
  );
}
