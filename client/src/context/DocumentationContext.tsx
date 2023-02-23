import { PageEntry } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import { useTailoring } from './TailoringContext';
import { NavMenuItem, NavTypeEnum, Section } from '../components/projekthandbuch/documentation/navigation/navigation';
import { getJsonDataFromXml, getMenuItemByAttributeValue } from '../shares/utils';

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
  };

  const {
    modelVariantId,
    // projectFeaturesDetails,
    // setProjectFeaturesDetails,
    // projectFeaturesDataFromProjectType,
    // projectFeaturesDataFromProjectTypeVariant,
  } = useTailoring();

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
      if (gefunden.type === NavTypeEnum.PRODUCT) {
        setDisciplineId(gefunden.parentId);
        setProductId(gefunden.key);
      }
    }

    void fetchSectionContentData(menuEntryId);

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

  async function fetchSectionContentData(sectionId: string): Promise<void> {
    const sectionContentUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Kapitel/' +
      sectionId;

    const jsonDataFromXml: any = await getJsonDataFromXml(sectionContentUrl);

    // console.log("jsonDataFromXml.getElementsByTagName('Kapitel')", jsonDataFromXml.getElementsByTagName('Kapitel'));

    // const xmlDataWithParent = addParentRecursive([jsonDataFromXml]);
    // console.log('xmlDataWithParent', xmlDataWithParent);

    // const sections: Section[] = jsonDataFromXml.getElementsByTagName('Kapitel').map((section: any) => {
    //   return section.attributes as Section;
    // });

    // setSectionsDetailsData(xmlDataWithParent);
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
