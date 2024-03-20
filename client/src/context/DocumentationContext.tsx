// import { PageEntry } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import {
  IndexTypeEnum,
  NavMenuItem,
  NavTypeEnum,
} from '../components/projekthandbuch/documentation/navigation/Navigation';
import { getMenuItemByAttributeValue } from '../shares/utils';
import { PageEntry } from '../components/projekthandbuch/documentation/Documentation';

type DocumentationSession = {
  selectedPageEntry: PageEntry | undefined;
  setSelectedPageEntry: Function;
  setSelectedItemKey: Function;
  selectedIndexType: IndexTypeEnum | undefined;
  setSelectedIndexType: Function;
  collapsed: boolean;
  setCollapsed: Function;
  navigationData: NavMenuItem[];
  setNavigationData: Function;
  disciplineId: string | null;
  productId: string | null;
  contentProductDependencyId: string | null;
  roleId: string | null;
  processModuleId: string | null;
  decisionPointId: string | null;
  processBuildingBlockId: string | null;
  methodReferenceId: string | null;
  toolReferenceId: string | null;
  projectCharacteristicId: string | null;
  projectTypeId: string | null;
  projectTypeVariantId: string | null;
  projectTypeVariantSequenceId: string | null;
  activityId: string | null;
  templateDisciplineId: string | null;
  productDisciplineId: string | null;
  entryId: string | null;
  getNavigationPath: Function;
  onRouteChanged: Function;
  currentSelectedKeys: string[];
  setCurrentSelectedKeys: Function;
  openKeys: string[];
  setOpenKeys: Function;
};

type DocumentationSessionProviderProps = { children: React.ReactNode };

const DocumentationSessionContext = React.createContext<DocumentationSession | undefined>(undefined);

const DocumentationSessionContextProvider = ({ children }: DocumentationSessionProviderProps) => {
  const [selectedPageEntry, setSelectedPageEntry] = React.useState<PageEntry>();
  const [selectedItemKey, setSelectedItemKey] = React.useState<string>();
  const [selectedIndexType, setSelectedIndexType] = React.useState<IndexTypeEnum>();
  const [currentSelectedKeys, setCurrentSelectedKeys] = React.useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState([]);

  // function setSelectedItemKey(key: string) {
  //   const navigate = useNavigate();
  //   navigate(`./${key}`);
  //   _setSelectedItemKey(key);
  // }

  // const [sectionsData, setSectionsData] = useState<Section[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [navigationData, setNavigationData] = useState<NavMenuItem[]>([]);

  const [disciplineId, setDisciplineId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [contentProductDependencyId, setContentProductDependencyId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [processModuleId, setProcessModuleId] = useState<string | null>(null);
  const [decisionPointId, setDecisionPointId] = useState<string | null>(null);
  const [processBuildingBlockId, setProcessBuildingBlockId] = useState<string | null>(null);
  const [methodReferenceId, setMethodReferenceId] = useState<string | null>(null);
  const [toolReferenceId, setToolReferenceId] = useState<string | null>(null);
  const [projectCharacteristicId, setProjectCharacteristicId] = useState<string | null>(null);
  const [projectTypeId, setProjectTypeId] = useState<string | null>(null);
  const [projectTypeVariantId, setProjectTypeVariantId] = useState<string | null>(null);
  const [projectTypeVariantSequenceId, setProjectTypeVariantSequenceId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [templateDisciplineId, setTemplateDisciplineId] = useState<string | null>(null);
  const [productDisciplineId, setProductDisciplineId] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);

  const value: DocumentationSession = {
    selectedPageEntry,
    setSelectedPageEntry,
    setSelectedItemKey,
    selectedIndexType,
    setSelectedIndexType,
    collapsed,
    setCollapsed,
    navigationData,
    setNavigationData,
    disciplineId,
    productId,
    contentProductDependencyId,
    roleId,
    processModuleId,
    decisionPointId,
    processBuildingBlockId,
    methodReferenceId,
    toolReferenceId,
    projectCharacteristicId,
    projectTypeId,
    projectTypeVariantId,
    projectTypeVariantSequenceId,
    activityId,
    templateDisciplineId,
    productDisciplineId,
    entryId,
    getNavigationPath,
    onRouteChanged,
    currentSelectedKeys,
    setCurrentSelectedKeys,
    openKeys,
    setOpenKeys,
  };

  useEffect(() => {
    // async function mount() {
    if (selectedItemKey) {
      onRouteChanged(selectedItemKey);
    }
    // }

    // mount().then();
    //eslint-disable-next-line
  }, [selectedItemKey]);

  useEffect(() => {
    // async function mount() {
    if (selectedIndexType) {
      onIndexPageSelected(selectedIndexType);
    }
    // }

    // mount().then();
    //eslint-disable-next-line
  }, [selectedIndexType]);

  function resetSelectedMenuEntryId() {
    setDisciplineId(null);
    setProductId(null);
    setContentProductDependencyId(null);
    setRoleId(null);
    setProcessModuleId(null);
    setDecisionPointId(null);
    setProcessBuildingBlockId(null);
    setMethodReferenceId(null);
    setToolReferenceId(null);
    setProjectCharacteristicId(null);
    setProjectTypeId(null);
    setProjectTypeVariantId(null);
    setProjectTypeVariantSequenceId(null);
    setActivityId(null);
    setTemplateDisciplineId(null);
    setProductDisciplineId(null);
    setEntryId(null);
  }

  function onRouteChanged(menuEntryId: string): void {
    setSelectedIndexType(undefined);
    resetSelectedMenuEntryId();

    const foundMenuItem = getMenuItemByAttributeValue(navigationData, 'key', menuEntryId);

    if (foundMenuItem !== undefined) {
      if (foundMenuItem.dataType === NavTypeEnum.PRODUCT) {
        if (foundMenuItem.parent) {
          setProductDisciplineId(foundMenuItem.parent.key);
          setProductId(foundMenuItem.key);
        }
      } else if (foundMenuItem.dataType === NavTypeEnum.PRODUCT_DISCIPLINE) {
        setProductDisciplineId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.DISCIPLINE) {
        setDisciplineId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.CONTENT_PRODUCT_DEPENDENCY) {
        setContentProductDependencyId(foundMenuItem.key);
      } else if (
        foundMenuItem.dataType &&
        [NavTypeEnum.PROJECT_ROLE, NavTypeEnum.PROJECT_TEAM_ROLE, NavTypeEnum.ORGANISATION_ROLE].includes(
          foundMenuItem.dataType
        )
      ) {
        setRoleId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.PROCESS_MODULE) {
        setProcessModuleId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.DECISION_POINT) {
        setDecisionPointId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.PROCESS_BUILDING_BLOCK) {
        setProcessBuildingBlockId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.METHOD_REFERENCE) {
        setMethodReferenceId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.TOOL_REFERENCE) {
        setToolReferenceId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.PROJECT_CHARACTERISTIC) {
        setProjectCharacteristicId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.PROJECT_TYPE) {
        setProjectTypeId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.PROJECT_TYPE_VARIANT) {
        setProjectTypeVariantId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.PROJECT_TYPE_VARIANT_SEQUENCE) {
        setProjectTypeVariantSequenceId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.ACTIVITY) {
        setActivityId(foundMenuItem.key);
      } else if (foundMenuItem.dataType === NavTypeEnum.TEMPLATE_DISCIPLINE) {
        setTemplateDisciplineId(foundMenuItem.key);
      } else {
        setEntryId(foundMenuItem.key);
      }
    }
  }

  function getNavigationPath(menuEntryId: string): { key: string; label: string }[] {
    let gefunden = getMenuItemByAttributeValue(navigationData, 'key', menuEntryId);
    if (gefunden) {
      const parentPath = [gefunden];

      while (gefunden) {
        if (gefunden.parent) {
          const parent = gefunden.parent;

          parentPath.push(parent);
          gefunden = gefunden.parent;
        } else {
          gefunden = undefined;
        }
      }
      return parentPath;
    } else {
      return [];
    }
  }

  function onIndexPageSelected(indexPageType: IndexTypeEnum): void {
    resetSelectedMenuEntryId();
    setSelectedIndexType(indexPageType);
  }

  return (
    // the Provider gives access to the context to its children
    <DocumentationSessionContext.Provider value={value}>{children}</DocumentationSessionContext.Provider>
  );
};

function useDocumentation() {
  const context = React.useContext(DocumentationSessionContext);
  if (context === undefined) {
    throw new Error('useDocumentation must be used within a DocumentationSessionContextProvider');
  }
  return context;
}

export { DocumentationSessionContext, DocumentationSessionContextProvider, useDocumentation };
