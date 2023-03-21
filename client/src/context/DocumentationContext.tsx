import { PageEntry } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import {
  IndexTypeEnum,
  NavMenuItem,
  NavTypeEnum,
  Section,
} from '../components/projekthandbuch/documentation/navigation/navigation';
import { getMenuItemByAttributeValue } from '../shares/utils';
import { useSearchParams } from 'react-router-dom';

type DocumentationSession = {
  selectedPageEntry: PageEntry | undefined;
  setSelectedPageEntry: Function;
  setSelectedItemKey: Function;
  selectedIndexType: IndexTypeEnum | undefined;
  setSelectedIndexType: Function;
  sectionsData: Section[];
  setSectionsData: Function;
  navigationData: NavMenuItem[];
  setNavigationData: Function;
  disciplineId: string | null;
  productId: string | null;
  roleId: string | null;
  processModuleId: string | null;
  decisionPointId: string | null;
  processBuildingBlockId: string | null;
  methodReferenceId: string | null;
  toolReferenceId: string | null;
  projectCharacteristicId: string | null;
  projectTypeId: string | null;
  projectTypeVariantId: string | null;
  activityId: string | null;
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
  const [searchParams, setSearchParams] = useSearchParams();
  // TODO: just temporary from search params
  const tailoringModelVariantId = searchParams.get('mV');
  const tailoringProjectTypeVariantId = searchParams.get('ptV');
  const tailoringProjectTypeId = searchParams.get('pt');
  // const tailoringProjectFeatureIdsSearchParam: MyType = {};

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

  const [sectionsData, setSectionsData] = useState<Section[]>([]);
  const [navigationData, setNavigationData] = useState<NavMenuItem[]>([]);

  const [disciplineId, setDisciplineId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [processModuleId, setProcessModuleId] = useState<string | null>(null);
  const [decisionPointId, setDecisionPointId] = useState<string | null>(null);
  const [processBuildingBlockId, setProcessBuildingBlockId] = useState<string | null>(null);
  const [methodReferenceId, setMethodReferenceId] = useState<string | null>(null);
  const [toolReferenceId, setToolReferenceId] = useState<string | null>(null);
  const [projectCharacteristicId, setProjectCharacteristicId] = useState<string | null>(null);
  const [projectTypeId, setProjectTypeId] = useState<string | null>(null);
  const [projectTypeVariantId, setProjectTypeVariantId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);

  const value: DocumentationSession = {
    selectedPageEntry,
    setSelectedPageEntry,
    setSelectedItemKey,
    selectedIndexType,
    setSelectedIndexType,
    sectionsData,
    setSectionsData,
    navigationData,
    setNavigationData,
    disciplineId,
    productId,
    roleId,
    processModuleId,
    decisionPointId,
    processBuildingBlockId,
    methodReferenceId,
    toolReferenceId,
    projectCharacteristicId,
    projectTypeId,
    projectTypeVariantId,
    activityId,
    entryId,
    getNavigationPath,
    onRouteChanged,
    currentSelectedKeys,
    setCurrentSelectedKeys,
    openKeys,
    setOpenKeys,
  };

  // const {
  //   modelVariantId,
  //   // projectFeaturesDetails,
  //   // setProjectFeaturesDetails,
  //   // projectFeaturesDataFromProjectType,
  //   // projectFeaturesDataFromProjectTypeVariant,
  // } = useTailoring();

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

  function onRouteChanged(menuEntryId: string): void {
    console.log('onRouteChanged content', menuEntryId);

    sectionsData.forEach((menu) => {
      console.log('sectionsData', menu);
    });

    const gefunden = getMenuItemByAttributeValue(navigationData, 'key', menuEntryId);
    console.log('gefunden:', gefunden);

    if (gefunden !== undefined) {
      if (gefunden.dataType === NavTypeEnum.PRODUCT) {
        setDisciplineId(gefunden.parent.key);
        setProductId(gefunden.key);
      } else if (
        [NavTypeEnum.PROJECT_ROLE, NavTypeEnum.PROJECT_TEAM_ROLE, NavTypeEnum.ORGANISATION_ROLE].includes(
          gefunden.dataType
        )
      ) {
        setRoleId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.PROCESS_MODULE) {
        setProcessModuleId(gefunden.key);
        console.log('setProcessModuleId');
      } else if (gefunden.dataType === NavTypeEnum.DECISION_POINT) {
        setDecisionPointId(gefunden.key);
        console.log('setDecisionPointId');
      } else if (gefunden.dataType === NavTypeEnum.PROCESS_BUILDING_BLOCK) {
        setProcessBuildingBlockId(gefunden.key);
        console.log('setProcessBuildingBlockId');
      } else if (gefunden.dataType === NavTypeEnum.METHOD_REFERENCE) {
        setMethodReferenceId(gefunden.key);
        console.log('setMethodReferenceId');
      } else if (gefunden.dataType === NavTypeEnum.TOOL_REFERENCE) {
        setToolReferenceId(gefunden.key);
        console.log('setToolReferenceId');
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_CHARACTERISTIC) {
        setProjectCharacteristicId(gefunden.key);
        console.log('setProjectCharacteristicId');
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_TYPE) {
        setProjectTypeId(gefunden.key);
        console.log('setProjectTypeId');
      } else if (gefunden.dataType === NavTypeEnum.PROJECT_TYPE_VARIANT) {
        setProjectTypeVariantId(gefunden.key);
        console.log('setProjectTypeVariantId');
      } else if (gefunden.dataType === NavTypeEnum.ACTIVITY) {
        setActivityId(gefunden.key);
        console.log('setActivityId');
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
