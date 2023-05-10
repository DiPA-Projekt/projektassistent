import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

interface MyType {
  [key: string]: string;
}

type TailoringSession = {
  setSearchParams: Function;
  projectFeaturesDetails: ProjectFeature[];
  setProjectFeaturesDetails: Function;
  projectFeaturesData: { fromProjectType: ProjectFeature[]; fromProjectTypeVariant: ProjectFeature[] } | undefined;
  setProjectFeaturesData: Function;
  modelVariantId: string | null;
  setModelVariantId: Function;
  projectTypeVariantId: string | null;
  setProjectTypeVariantId: Function;
  projectTypeId: string | null;
  setProjectTypeId: Function;
  // projectFeatureIds: { [key: string]: string } | null;
  // setProjectFeatureIds: Function;
  projectFeatures: { [key: string]: string } | null;
  setProjectFeatures: Function;
  getProjectFeaturesQueryString: Function;
};

type TailoringSessionProviderProps = { children: React.ReactNode };

const TailoringSessionContext = React.createContext<TailoringSession | undefined>(undefined);

const TailoringSessionContextProvider = ({ children }: TailoringSessionProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projectFeaturesDetails, setProjectFeaturesDetails] = React.useState<ProjectFeature[]>([]);
  const [projectFeaturesData, setProjectFeaturesData] = React.useState<{
    fromProjectType: ProjectFeature[];
    fromProjectTypeVariant: ProjectFeature[];
  }>();

  const [modelVariantId, _setModelVariantId] = useState<string | null>(null);

  function setModelVariantId(newModelVariantId: string | null) {
    _setModelVariantId(newModelVariantId);
    _setProjectTypeVariantId(null);
    _setProjectFeatures(null);
    // _setProjectTypeId(null);
    if (newModelVariantId) {
      setSearchParams({ mV: newModelVariantId });
    } else {
      setSearchParams();
    }
  }

  const [projectTypeVariantId, _setProjectTypeVariantId] = useState<string | null>(null);
  function setProjectTypeVariantId(newProjectTypeVariantId: string | null) {
    _setProjectTypeVariantId(newProjectTypeVariantId);
    // TODO, wenn null, dann dürfen die Werte jeweils nicht gesetzt werden

    // const searchParams = { mV: modelVariantId, ptV: newProjectTypeVariantId, pt: projectTypeId };
    // if (searchParams != null) {
    // setSearchParams(clean(searchParams));
    // }
    console.log('setProjectTypeVariantId', newProjectTypeVariantId);
    // console.log('searchParams after', searchParams);

    setProjectFeaturesData(undefined);

    //setProjectTypeId(null); // TODO ist eigentlich nicht nötig, weil es auch

    _setProjectFeatures(null);
  }

  const [projectTypeId, setProjectTypeId] = useState<string | null>(null);
  // TODO: projectFeatureIds
  // const [projectFeatureIds, setProjectFeatureIds] = useState<MyType | null>(null);
  const [projectFeatures, _setProjectFeatures] = useState<{ [key: string]: string } | null>(null);

  function setProjectFeatures(newProjectFeatures: { [key: string]: string } | null) {
    _setProjectFeatures(newProjectFeatures);
    console.log('setProjectFeatures', newProjectFeatures);

    // TODO: modelVariantId, projectTypeVariantId, projectTypeId bei reload nicht gesetzt
    setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...newProjectFeatures });
  }

  const value: TailoringSession = {
    setSearchParams,
    projectFeaturesDetails,
    setProjectFeaturesDetails,
    projectFeaturesData,
    setProjectFeaturesData,
    modelVariantId,
    setModelVariantId,
    projectTypeVariantId,
    setProjectTypeVariantId,
    projectTypeId,
    setProjectTypeId,
    // projectFeatureIds,
    // setProjectFeatureIds,
    projectFeatures,
    setProjectFeatures,
    getProjectFeaturesQueryString,
  };

  function getProjectFeaturesQueryString(): string {
    if (projectFeatures) {
      return Object.keys(projectFeatures || '')
        .map((key: string) => {
          return `${key}=${projectFeatures[key]}`;
        })
        .join('&');
    } else {
      return '';
    }
  }

  useEffect(() => {
    const modelVariantIdSearchParam = searchParams.get('mV');
    console.log('modelVariantId on mount', modelVariantIdSearchParam);
    const projectTypeVariantIdSearchParam = searchParams.get('ptV');
    const projectTypeIdSearchParam = searchParams.get('pt');
    const projectFeatureIdsSearchParam: MyType = {};

    if (modelVariantIdSearchParam) {
      _setModelVariantId(modelVariantIdSearchParam);
    }
    if (projectTypeVariantIdSearchParam) {
      _setProjectTypeVariantId(projectTypeVariantIdSearchParam);
    }
    if (projectTypeIdSearchParam) {
      setProjectTypeId(projectTypeIdSearchParam);
    }

    searchParams.forEach((value, key) => {
      if (!['mV', 'ptV', 'pt'].includes(key)) {
        projectFeatureIdsSearchParam[key] = value;
      }
    });

    if (Object.keys(projectFeatureIdsSearchParam).length > 0) {
      setProjectFeatures(projectFeatureIdsSearchParam);
    }

    // eslint-disable-next-line
  }, []);

  const { pathname } = useLocation();

  useEffect(() => {
    console.log('Location update', pathname);

    if (modelVariantId && projectTypeVariantId && projectTypeId && projectFeatures) {
      setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...projectFeatures });
    }
  }, [pathname]);

  // const [searchParams, setSearchParams] = useSearchParams();
  // TODO: just temporary from search params
  // const tailoringModelVariantId = searchParams.get('mV');
  // const tailoringProjectTypeVariantId = searchParams.get('ptV');
  // const tailoringProjectTypeId = searchParams.get('pt');

  useEffect(() => {
    console.log('searchParams update', searchParams);
  }, [searchParams]);

  // useEffect(() => {
  //   console.log('useEffect modelVariantId', modelVariantId);
  //   setProjectTypeVariantId(null);
  //   setProjectTypeId(null);
  // }, [modelVariantId]);

  // useEffect(() => {
  //   setProjectTypeId(null);
  // }, [projectTypeVariantId]);

  return (
    // the Provider gives access to the context to its children
    <TailoringSessionContext.Provider value={value}>{children}</TailoringSessionContext.Provider>
  );
};

function useTailoring() {
  const context = React.useContext(TailoringSessionContext);
  if (context === undefined) {
    throw new Error('useTailoring must be used within a TailoringSessionContextProvider');
  }
  return context;
}

export { TailoringSessionContext, TailoringSessionContextProvider, useTailoring };
