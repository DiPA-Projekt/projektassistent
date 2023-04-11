import { SelectTree } from './selectTree/component';
import { Collapse, Popover } from 'antd';
import { BookTwoTone, ContainerTwoTone, FileExcelTwoTone, FileTextTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import React from 'react';
import { DataNode } from 'antd/lib/tree';
import { useTemplate } from '../../../context/TemplateContext';
import { NavTypeEnum } from '../documentation/navigation/navigation';

const { Panel } = Collapse;

// const projectTemplates = TEMPLATE_DATA as TemplateProps[];

// Tiny helper interfaces till OpenApi is updated
export interface TemplateProps {
  key: string;
  dataType?: string;
  checkable: boolean;
  checked: boolean;
  disabled: boolean;
  label: string;
  infoText?: string;
  selected?: boolean;
  selectable?: boolean;
  url?: string;
  files?: TemplateProps[];
  children?: TemplateProps[];
}

function getIcon(icon: string | undefined): JSX.Element {
  switch (icon) {
    case 'sample':
      return <FileTextTwoTone twoToneColor="#cf1322" />;
    case NavTypeEnum.TOPIC:
      return <BookTwoTone twoToneColor="#389e0d" />;
    case NavTypeEnum.PRODUCT:
      return <ContainerTwoTone twoToneColor="#096dd9" />;
    case 'excel':
      return <FileExcelTwoTone twoToneColor="#454545" />;
    default:
      return <></>;
  }
}

export function TemplatesContent(props: { entries: TemplateProps[] }) {
  const { showAll } = useTemplate();

  // const showAll = props.ctrl.showAll;

  function callback(key: string | string[]) {
    console.log(key);
  }

  function getTreeData(inputData: TemplateProps[]): DataNode[] {
    const result: DataNode[] = [];

    for (const entry of inputData) {
      const header = (
        <>
          <span style={{ marginRight: '8px' }}>
            {entry.dataType === NavTypeEnum.PRODUCT ? 'Generierte Vorlage' : entry.label}
          </span>
          {entry.dataType !== NavTypeEnum.PRODUCT && (
            <Popover destroyTooltipOnHide={true} content={entry.infoText} title={entry.label}>
              <InfoCircleTwoTone style={{ cursor: 'help' }} />
            </Popover>
          )}
        </>
      );

      result.push({
        title: header,
        key: entry.key.toString(),
        className: entry?.checkable === false ? 'hideMe' : '',
        // checkable: entry?.checkable !== false,
        // disableCheckbox: entry?.disableCheckbox === true,
        selectable: false,
        icon: getIcon(entry.dataType),
        children: getTreeData(entry.children || []),
      });
    }

    return result || [];
  }

  const templatePanels = [];
  for (const templateEntry of props.entries as TemplateProps[]) {
    const submenuEntries = [];

    if (templateEntry.children) {
      for (const submenuEntry of templateEntry.children) {
        const fileEntries = [];
        if (submenuEntry.files) {
          fileEntries.push(
            <SelectTree
              key={submenuEntry.key}
              data={getTreeData(submenuEntry.files)}
              checkedKeys={[]}
              // checkedKeys={props.ctrl.getCheckedKeys([submenuEntry])}
              disabled={submenuEntry.disabled}
            />
          );
        }

        const header = (
          <div style={{ color: submenuEntry.disabled ? '#cccccc' : '' }}>
            <span style={{ marginRight: '8px' }}>{submenuEntry.label}</span>
            <Popover destroyTooltipOnHide={true} content={submenuEntry.infoText} title={submenuEntry.label}>
              <InfoCircleTwoTone style={{ cursor: 'help' }} />
            </Popover>
          </div>
        );

        if (!submenuEntry.disabled || showAll) {
          submenuEntries.push(
            <Collapse key={submenuEntry?.key.toString()} ghost>
              <Panel key={submenuEntry?.key.toString()} header={header}>
                <SelectTree
                  data={getTreeData([submenuEntry])}
                  checkedKeys={[]}
                  // checkedKeys={props.ctrl.getCheckedKeys([submenuEntry])}
                  disabled={submenuEntry.disabled}
                />
                {fileEntries}
              </Panel>
            </Collapse>
          );
        }
      }
    }

    templatePanels.push(
      <Panel key={templateEntry?.key.toString()} header={templateEntry.label}>
        {submenuEntries}
      </Panel>
    );
  }

  return (
    <>
      <h2>Vorlagen</h2>
      Hier sehen Sie die Liste aller Produkte, die für Ihr Projekt relevant sind. Sie können die vorgeschlagene Auswahl
      an Textbausteinen übernehmen oder an der Auswahl nach Belieben Änderungen vornehmen (Vorlagen für initiale
      Produkte können nicht abgewählt werden). Der Button "Vorlagen erzeugen" startet den Generierungsvorgang.
      <Collapse onChange={callback} style={{ marginTop: '20px' }}>
        {templatePanels}
      </Collapse>
    </>
  );
}
