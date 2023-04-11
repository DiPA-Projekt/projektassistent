import React, { useState } from 'react';

type TemplateSession = {
  selectAll: boolean;
  setSelectAll: Function;
  showAll: boolean;
  setShowAll: Function;
};

type TemplateSessionProviderProps = { children: React.ReactNode };

const TemplateSessionContext = React.createContext<TemplateSession | undefined>(undefined);

const TemplateSessionContextProvider = ({ children }: TemplateSessionProviderProps) => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);

  const value: TemplateSession = {
    selectAll,
    setSelectAll,
    showAll,
    setShowAll,
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
