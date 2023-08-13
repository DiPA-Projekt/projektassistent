import { Checkbox, Popover, Tree } from 'antd';
import {
  BookTwoTone,
  ContainerTwoTone,
  DownOutlined,
  FileExcelTwoTone,
  FileTextTwoTone,
  InfoCircleTwoTone,
} from '@ant-design/icons';
import React, { useEffect } from 'react';
import { DataNode } from 'antd/lib/tree';
import { NavTypeEnum } from '../documentation/navigation/Navigation';
import { useTemplate } from '../../../context/TemplateContext';
import parse from 'html-react-parser';
import { removeHtmlTags } from '../../../shares/utils';

// const { Panel } = Collapse;

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
  const {
    checkedKeys,
    setCheckedKeys,
    selectedKeys,
    setSelectedKeys,
    expandedKeys,
    setExpandedKeys,
    autoExpandParent,
    setAutoExpandParent,
    setProductsMap,
  } = useTemplate();

  const productsMap = new Map<
    string,
    {
      product: { id: string; title: string };
      discipline: { id: string; title: string };
      topics: { title: string; text: string }[];
    }
  >();

  const [treeEntries, setTreeEntries] = React.useState<DataNode[]>([]);

  useEffect(() => {
    setTreeEntries(getTreeData(props.entries));
  }, [props.entries]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: React.Key[]) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
  };

  function getTreeData(inputData: TemplateProps[]): DataNode[] {
    // console.log('inputData', inputData);
    const result: DataNode[] = [];

    for (const discipline of inputData) {
      // await

      const disciplineHeader = (
        <>
          <span style={{ marginRight: '8px' }}>
            {discipline.label}
            {/*{entry.dataType === NavTypeEnum.PRODUCT ? 'Generierte Vorlage' : entry.label}*/}
          </span>
          {/*comment out for now till data is not loaded at this time*/}
          {/*<Popover destroyTooltipOnHide={true} content={discipline.infoText} title={discipline.label}>*/}
          {/*  <InfoCircleTwoTone style={{ cursor: 'help' }} />*/}
          {/*</Popover>*/}
        </>
      );

      const productTreeItems = [];

      if (discipline.children) {
        for (const product of discipline.children) {
          const productHeader = (
            <>
              <span style={{ marginRight: '8px' }}>{product.label}</span>
            </>
          );

          const topicsTreeItems = [];
          const topicsForMap = [];

          if (product.children) {
            for (const topic of product.children) {
              if (topic.infoText != null) {
                const topicHeader = (
                  <>
                    <span style={{ marginRight: '8px' }}>{topic.label}</span>
                    <Popover destroyTooltipOnHide={true} content={parse(topic.infoText)} title={topic.label}>
                      <InfoCircleTwoTone style={{ cursor: 'help' }} />
                    </Popover>
                  </>
                );

                topicsTreeItems.push({
                  title: topicHeader,
                  key: topic.key,
                  selectable: true,
                  checkable: false,
                  icon: getIcon(topic.dataType),
                });

                topicsForMap.push({ title: topic.label, text: removeHtmlTags(topic.infoText) });
              }
            }
          }

          productsMap.set(product.key, {
            product: { id: product.key, title: product.label },
            discipline: { id: discipline.key, title: discipline.label },
            topics: topicsForMap,
          });

          if (topicsTreeItems.length > 0) {
            productTreeItems.push({
              title: productHeader,
              key: product.key,
              selectable: true,
              icon: getIcon(product.dataType),
              children: topicsTreeItems,
            });
          }
        }
      }

      if (productTreeItems.length > 0) {
        result.push({
          title: disciplineHeader,
          key: discipline.key,
          selectable: false,
          icon: getIcon(discipline.dataType),
          children: productTreeItems,
        });
      }
    }

    setProductsMap(productsMap);

    return result || [];
  }

  // Call this once
  const getAllKeys = (tree: any[]) => {
    const result: any[] = [];
    tree.forEach((x) => {
      let childKeys = [];
      if (x.children) {
        childKeys = getAllKeys(x.children);
      }

      result.push(...[x.key, ...childKeys]);
    });

    return result;
  };

  const allKeys = getAllKeys(treeEntries);

  const onChange = () => {
    if (checkedKeys.length === allKeys.length) {
      setCheckedKeys([]);
    } else {
      setCheckedKeys(allKeys);
    }
  };

  return (
    <>
      <h2>Vorlagen</h2>
      Hier sehen Sie die Liste aller Produkte, die für Ihr Projekt relevant sind. Sie können die vorgeschlagene Auswahl
      an Textbausteinen übernehmen oder an der Auswahl nach Belieben Änderungen vornehmen (Vorlagen für initiale
      Produkte können nicht abgewählt werden). Der Button "Vorlagen erzeugen" startet den Generierungsvorgang.
      {/*<Collapse onChange={callback} style={{ marginTop: '20px' }}>*/}
      <div style={{ marginTop: '10px', height: '24px' }}>
        <Checkbox onChange={onChange} checked={checkedKeys.length === allKeys.length}>
          Alles auswählen
        </Checkbox>
      </div>
      <Tree
        checkable
        showIcon={true}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        onSelect={onSelect}
        checkedKeys={checkedKeys}
        selectedKeys={selectedKeys}
        switcherIcon={<DownOutlined />}
        treeData={treeEntries}
        defaultCheckedKeys={checkedKeys}
      />
      {/*{submenuEntries}*/}
      {/*</Collapse>*/}
    </>
  );
}
