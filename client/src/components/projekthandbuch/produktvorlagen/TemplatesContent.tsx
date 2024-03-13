import { Checkbox, Popover, Tree } from 'antd';
import { BookTwoTone, ContainerTwoTone, DownOutlined, FileTextTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import React, { Key, useEffect } from 'react';
import { DataNode, EventDataNode } from 'antd/lib/tree';
import { NavTypeEnum } from '../documentation/navigation/Navigation';
import { useTemplate } from '../../../context/TemplateContext';
import parse from 'html-react-parser';

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

interface CheckInfo<T> {
  checked: boolean;
  checkedNodes: T[];
  halfCheckedNodes: React.Key[];
  node: EventDataNode<T>;
}

function getIcon(icon: string | undefined): JSX.Element {
  switch (icon) {
    case NavTypeEnum.SAMPLE_TEXT:
      return <FileTextTwoTone twoToneColor="#cf1322" />;
    case NavTypeEnum.TOPIC:
      return <BookTwoTone twoToneColor="#389e0d" />;
    case NavTypeEnum.PRODUCT:
      return <ContainerTwoTone twoToneColor="#096dd9" />;
    case NavTypeEnum.EXTERNAL_TEMPLATE:
      return <FileTextTwoTone twoToneColor="#454545" />;
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
      externalCopyTemplates: { title: string; uri: string }[];
    }
  >();

  const [treeEntries, setTreeEntries] = React.useState<DataNode[]>([]);

  useEffect(() => {
    setTreeEntries(getTreeData(props.entries));
  }, [props.entries]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    //console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  function setChildrenDisabledStatus(node: DataNode, disabled: boolean) {
    if (node.children) {
      for (const child of node.children) {
        if (child.className && (' ' + child.className + ' ').indexOf(' canBeDisabled ') > -1) {
          child.disabled = disabled;
        }
        setChildrenDisabledStatus(child, disabled);
      }
    }
  }

  const onCheck = (e: Key[] | { checked: Key[]; halfChecked: Key[] }, info: CheckInfo<DataNode>) => {
    setChildrenDisabledStatus(info.node, !info.checked);
    setCheckedKeys({ checked: e });
  };

  const onSelect = (selectedKeysValue: React.Key[]) => {
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

      const productTreeItems: DataNode[] = [];

      if (discipline.children) {
        for (const product of discipline.children) {
          const productHeader = (
            <>
              <span style={{ marginRight: '8px' }}>{product.label}</span>
            </>
          );

          const topicsTreeItems = [];
          const topicsForMap = [];
          const externalCopyTemplatesForMap = [];

          if (product.children) {
            const topicChildren = product.children.filter((child) => child.dataType === NavTypeEnum.TOPIC);
            const externalCopyChildren = product.children.filter(
              (child) => child.dataType === NavTypeEnum.EXTERNAL_TEMPLATE
            );

            if (topicChildren.length > 0) {
              const generatedTemplateTreeItems: DataNode[] = [];

              for (const topic of topicChildren) {
                const topicHeader = (
                  <>
                    <span style={{ marginRight: '8px' }}>{topic.label}</span>
                    <Popover destroyTooltipOnHide={true} content={parse(topic.infoText)} title={topic.label}>
                      <InfoCircleTwoTone style={{ cursor: 'help' }} />
                    </Popover>
                  </>
                );

                const samplesTreeItems: DataNode[] = [];
                const samplesForMap = [];

                if (topic.children) {
                  for (const sample of topic.children) {
                    const sampleHeader = (
                      <>
                        <span style={{ marginRight: '8px' }}>{parse(sample.label)}</span>
                        {sample.infoText && (
                          <>
                            <Popover destroyTooltipOnHide={true} content={parse(sample.infoText)}>
                              <InfoCircleTwoTone style={{ cursor: 'help' }} />
                            </Popover>
                          </>
                        )}
                      </>
                    );

                    samplesTreeItems.push({
                      title: sampleHeader,
                      key: sample.key,
                      selectable: true,
                      checkable: true,
                      disabled: !product.checked,
                      icon: getIcon(sample.dataType),
                      children: [],
                      className: 'canBeDisabled',
                    });

                    samplesForMap.push({ id: sample.key, title: sample.label, text: sample.infoText });
                  }
                }

                generatedTemplateTreeItems.push({
                  title: topicHeader,
                  key: topic.key,
                  selectable: true,
                  checkable: false,
                  disabled: !product.checked,
                  disableCheckbox: false,
                  icon: getIcon(topic.dataType),
                  children: samplesTreeItems,
                  className: 'canBeDisabled',
                });

                topicsForMap.push({
                  id: topic.key,
                  title: topic.label,
                  text: topic.infoText,
                  samples: samplesForMap,
                });
              }

              // Generierte Vorlage
              topicsTreeItems.push({
                title: 'Generierte Vorlage',
                key: product.key,
                selectable: true,
                checkable: true,
                disabled: false,
                icon: null,
                children: generatedTemplateTreeItems,
              });
            }

            if (externalCopyChildren.length > 0) {
              for (const externalCopy of externalCopyChildren) {
                const externalCopyHeader = (
                  <>
                    <span style={{ marginRight: '8px' }}>{externalCopy.label}</span>
                    <Popover
                      destroyTooltipOnHide={true}
                      content={parse(externalCopy.infoText)}
                      title={externalCopy.label}
                    >
                      <InfoCircleTwoTone style={{ cursor: 'help' }} />
                    </Popover>
                  </>
                );

                topicsTreeItems.push({
                  title: externalCopyHeader,
                  key: externalCopy.key,
                  selectable: true,
                  checkable: true,
                  disabled: false,
                  disableCheckbox: false,
                  icon: getIcon(externalCopy.dataType),
                  children: [],
                });

                externalCopyTemplatesForMap.push({
                  id: externalCopy.key,
                  title: externalCopy.label,
                  uri: externalCopy.infoText,
                });
              }
            }
          }

          productsMap.set(product.key, {
            product: { id: product.key, title: product.label },
            discipline: { id: discipline.key, title: discipline.label },
            topics: topicsForMap,
            externalCopyTemplates: externalCopyTemplatesForMap,
          });

          if (topicsTreeItems.length > 0) {
            productTreeItems.push({
              title: productHeader,
              key: product.key + '_generatedTemplate',
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
  const getAllKeys = (tree: DataNode[]) => {
    const result: Key[] = [];
    tree.forEach((x) => {
      let childKeys: Key[] = [];
      if (x.children) {
        childKeys = getAllKeys(x.children);
      }

      result.push(...[x.key, ...childKeys]);
    });

    return result;
  };

  const allKeys = getAllKeys(treeEntries);

  const onChange = () => {
    const checkedAll = checkedKeys.checked.length === allKeys.length;

    for (const entry of treeEntries) {
      setChildrenDisabledStatus(entry, checkedAll);
    }
    if (checkedAll) {
      setCheckedKeys({ checked: [], halfChecked: [] });
    } else {
      setCheckedKeys({ checked: allKeys, halfChecked: [] });
    }
  };

  return (
    <>
      <div style={{ marginTop: '10px', height: '24px' }}>
        <Checkbox onChange={onChange} checked={checkedKeys.checked.length === allKeys.length}>
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
        defaultCheckedKeys={checkedKeys.checked}
      />
    </>
  );
}
