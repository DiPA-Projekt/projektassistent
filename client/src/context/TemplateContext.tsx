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
  topicsMap: any;
  setTopicsMap: Function;
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

  const [topicsMap, setTopicsMap] = useState();

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
    topicsMap,
    setTopicsMap,
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
