import { PageEntry } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import { NavMenuItem, NavTypeEnum, Section } from '../components/projekthandbuch/documentation/navigation/navigation';
import { getMenuItemByAttributeValue } from '../shares/utils';

type DocumentationSession = {
  selectedPageEntry: PageEntry;
  setSelectedPageEntry: Function;
  setSelectedItemKey: Function;
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
  entryId: string | null;
};

type DocumentationSessionProviderProps = { children: React.ReactNode };

const DocumentationSessionContext = React.createContext<DocumentationSession | undefined>(undefined);

const DocumentationSessionContextProvider = ({ children }: DocumentationSessionProviderProps) => {
  const [selectedPageEntry, setSelectedPageEntry] = React.useState<PageEntry>();
  const [selectedItemKey, setSelectedItemKey] = React.useState<string>();

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
  const [entryId, setEntryId] = useState<string | null>(null);

  const value: DocumentationSession = {
    selectedPageEntry,
    setSelectedPageEntry,
    setSelectedItemKey,
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
    entryId,
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
  }, [selectedItemKey]);

  function onRouteChanged(menuEntryId: string): void {
    console.log('onRouteChanged content', menuEntryId);

    sectionsData.forEach((menu) => {
      console.log('sectionsData', menu);
    });

    const gefunden = getMenuItemByAttributeValue(navigationData, 'key', menuEntryId);
    console.log('gefunden:', gefunden);

    if (gefunden !== undefined) {
      if (gefunden.dataType === NavTypeEnum.PRODUCT) {
        setDisciplineId(gefunden.parentId);
        setProductId(gefunden.key);
      } else if (gefunden.dataType === NavTypeEnum.ROLE) {
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
      } else {
        setEntryId(gefunden.key);
      }
    }

    // this.projectTypeSubscription = this.projekthandbuchService
    //   .getNavigationData()
    //   .subscribe((menuEntries: NavigationMenuEntry[]) => {
    //     menuEntries.forEach((menu) => {
    //       const foundMenuEntry = findIdInMenuEntry(menuEntryId, menu.entries);
    //       if (foundMenuEntry) {
    //         switch (menu.title) {
    //           case 'products':
    //             void this.productsContentController.getContent().then((response: PageEntry) => {
    //               this.selectedPageEntry = response;
    //               this.onUpdate();
    //             });
    //             break;
    //           case 'process':
    //             void this.processContentController.getContent().then((response: PageEntry) => {
    //               this.selectedPageEntry = response;
    //               this.onUpdate();
    //             });
    //             break;
    //           case 'roles':
    //             void this.rolesContentController.getContent().then((response: PageEntry) => {
    //               this.selectedPageEntry = response;
    //               this.onUpdate();
    //             });
    //             break;
    //           case 'tailoring':
    //             void this.tailoringContentController.getContent().then((response: PageEntry) => {
    //               this.selectedPageEntry = response;
    //               this.onUpdate();
    //             });
    //             break;
    //         }
    //       }
    //     });
    //   });
    //
    // this.projectTypeSubscription.unsubscribe();
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
