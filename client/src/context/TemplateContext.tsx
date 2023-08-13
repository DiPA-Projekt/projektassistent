import React, { useState } from 'react';

type TemplateSession = {
  selectAll: boolean;
  setSelectAll: Function;
  showAll: boolean;
  setShowAll: Function;
  expandedKeys: React.Key[];
  setExpandedKeys: Function;
  checkedKeys: React.Key[];
  setCheckedKeys: Function;
  selectedKeys: React.Key[];
  setSelectedKeys: Function;
  autoExpandParent: boolean;
  setAutoExpandParent: Function;
  productsMap: Map<
    React.Key,
    {
      product: { id: string; title: string };
      discipline: { id: string; title: string };
      topics: { title: string; text: string }[];
    }
  >;
  setProductsMap: Function;

  insertTopicDescription: boolean;
  setInsertTopicDescription: Function;
  checkAllProductTemplates: boolean;
  setCheckAllProductTemplates: Function;
};

type TemplateSessionProviderProps = { children: React.ReactNode };

const TemplateSessionContext = React.createContext<TemplateSession | undefined>(undefined);

const TemplateSessionContextProvider = ({ children }: TemplateSessionProviderProps) => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [insertTopicDescription, setInsertTopicDescription] = useState<boolean>(true);
  const [checkAllProductTemplates, setCheckAllProductTemplates] = useState<boolean>(true);

  const [productsMap, setProductsMap] = useState(
    new Map<
      React.Key,
      {
        product: { id: string; title: string };
        discipline: { id: string; title: string };
        topics: { title: string; text: string }[];
      }
    >()
  );

  const value: TemplateSession = {
    selectAll,
    setSelectAll,
    showAll,
    setShowAll,
    expandedKeys,
    setExpandedKeys,
    checkedKeys,
    setCheckedKeys,
    selectedKeys,
    setSelectedKeys,
    autoExpandParent,
    setAutoExpandParent,
    productsMap,
    setProductsMap,
    insertTopicDescription,
    setInsertTopicDescription,
    checkAllProductTemplates,
    setCheckAllProductTemplates,
  };

  return (
    // the Provider gives access to the context to its children
    <TemplateSessionContext.Provider value={value}>{children}</TemplateSessionContext.Provider>
  );
};

function useTemplate() {
  const context = React.useContext(TemplateSessionContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateSessionContextProvider');
  }
  return context;
}

export { TemplateSessionContext, TemplateSessionContextProvider, useTemplate };
