import { PageEntry } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import {
  IndexTypeEnum,
  NavMenuItem,
  NavTypeEnum,
} from '../components/projekthandbuch/documentation/navigation/navigation';
import { getMenuItemByAttributeValue } from '../shares/utils';

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
  }, [selectedItemKey]); // TODO selectedIndexType

  useEffect(() => {
    // async function mount() {
    if (selectedIndexType) {
      onIndexPageSelected(selectedIndexType);
    }
    // }

    // mount().then();
    //eslint-disable-next-line
  }, [selectedIndexType]); // TODO selectedIndexType

  // TODO: onIndexPageChanged

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
    setEntryId(null);
  }

  function onRouteChanged(menuEntryId: string): void {
    console.log('onRouteChanged content', menuEntryId);

    resetSelectedMenuEntryId();

    const gefunden = getMenuItemByAttributeValue(navigationData, 'key', menuEntryId);
    console.log('gefunden:', gefunden);

    if (gefunden !== undefined) {
      if (gefunden.dataType === NavTypeEnum.PRODUCT) {
        setDisciplineId(gefunden.parent.key);
        setProductId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.DISCIPLINE) {
        setDisciplineId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.CONTENT_PRODUCT_DEPENDENCY) {
        setContentProductDependencyId(gefunden.key);
      } else if (
        [NavTypeEnum.PROJECT_ROLE, NavTypeEnum.PROJECT_TEAM_ROLE, NavTypeEnum.ORGANISATION_ROLE].includes(
          gefunden.dataType
        )
      ) {
        setRoleId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROCESS_MODULE) {
        setProcessModuleId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.DECISION_POINT) {
        setDecisionPointId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROCESS_BUILDING_BLOCK) {
        setProcessBuildingBlockId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.METHOD_REFERENCE) {
        setMethodReferenceId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.TOOL_REFERENCE) {
        setToolReferenceId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_CHARACTERISTIC) {
        setProjectCharacteristicId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_TYPE) {
        setProjectTypeId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_TYPE_VARIANT) {
        setProjectTypeVariantId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_TYPE_VARIANT_SEQUENCE) {
        setProjectTypeVariantSequenceId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.ACTIVITY) {
        setActivityId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.TEMPLATE_DISCIPLINE) {
        setTemplateDisciplineId(gefunden.key);
      } else {
        setEntryId(gefunden.key);
      }
    }
  }

  function getNavigationPath(menuEntryId: string): { key: string; label: string }[] {
    let gefunden = getMenuItemByAttributeValue(navigationData, 'key', menuEntryId);
    console.log('getNavigationPath call', gefunden, navigationData);

    const parentPath = [gefunden];

    while (gefunden) {
      if (gefunden.parent) {
        console.log(gefunden.parent.key);

        const parent = gefunden.parent;

        parentPath.push(parent);
        gefunden = gefunden.parent;
      } else {
        gefunden = false;
      }
    }
    return parentPath;
  }

  function onIndexPageSelected(indexPageType: IndexTypeEnum): void {
    console.log('onIndexPageSelected content', indexPageType);
    setSelectedIndexType(indexPageType);
  }

  // async function fetchSectionContentData(sectionId: string): Promise<any> {
  //   const sectionContentUrl =
  //     'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
  //     modelVariantId +
  //     '/Kapitel/' +
  //     sectionId;
  //
  //   const jsonDataFromXml: any = await getJsonDataFromXml(sectionContentUrl);
  //   const textPart = jsonDataFromXml.children.find((child: any) => child.name === 'Text')?.value;
  //
  //   return {
  //     id: jsonDataFromXml.attributes.id,
  //     header: jsonDataFromXml.attributes.name,
  //     descriptionText: textPart,
  //     tableEntries: [],
  //     subPageEntries: [],
  //   };
  // }

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
