import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { clean } from '../shares/utils';

interface MyType {
  [key: string]: string;
}

type TailoringSession = {
  setSearchParams: Function;
  projectFeaturesDetails: ProjectFeature[];
  setProjectFeaturesDetails: Function;
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
  tailoringParameter: {
    modelVariantId?: string;
    projectTypeVariantId?: string;
    projectTypeId?: string;
    projectFeatures?: MyType;
  };
  setTailoringParameter: Function;
};

type TailoringSessionProviderProps = { children: React.ReactNode };

const TailoringSessionContext = React.createContext<TailoringSession | undefined>(undefined);

const TailoringSessionContextProvider = ({ children }: TailoringSessionProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projectFeaturesDetails, setProjectFeaturesDetails] = React.useState<ProjectFeature[]>([]);

  const [tailoringParameter, setTailoringParameter] = useState<{
    modelVariantId?: string;
    projectTypeVariantId?: string;
    projectTypeId?: string;
    projectFeatures?: MyType;
  }>({});

  const [modelVariantId, setModelVariantId] = useState<string | null>(null);
  const [projectTypeVariantId, setProjectTypeVariantId] = useState<string | null>(null);
  const [projectTypeId, setProjectTypeId] = useState<string | null>(null);
  const [projectFeatures, setProjectFeatures] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    console.log('tailoringParameter', tailoringParameter);

    const searchParams = {
      mV: tailoringParameter.modelVariantId,
      ptV: tailoringParameter.projectTypeVariantId,
      pt: tailoringParameter.projectTypeId,
      ...tailoringParameter.projectFeatures,
    };
    // if (searchParams != null) {
    setSearchParams(clean(searchParams));
    // }
  }, [tailoringParameter]);

  const value: TailoringSession = {
    setSearchParams,
    projectFeaturesDetails,
    setProjectFeaturesDetails,
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
    tailoringParameter,
    setTailoringParameter,
  };

  function getProjectFeaturesQueryString(): string {
    if (tailoringParameter.projectFeatures) {
      return Object.keys(tailoringParameter.projectFeatures || '')
        .map((key: string) => {
          return `${key}=${tailoringParameter.projectFeatures[key]}`;
        })
        .join('&');
    } else {
      return '';
    }
  }

  useEffect(() => {
    const projectFeatureIdsSearchParam: MyType = {};
    searchParams.forEach((value, key) => {
      if (!['mV', 'ptV', 'pt'].includes(key)) {
        projectFeatureIdsSearchParam[key] = value;
      }
    });

    const tailoringSearchParams = {
      modelVariantId: searchParams.get('mV'),
      projectTypeVariantId: searchParams.get('ptV'),
      projectTypeId: searchParams.get('pt'),
      projectFeatures: projectFeatureIdsSearchParam,
    };

    setTailoringParameter(clean(tailoringSearchParams));
    console.log('ON LOAD setTailoringParameter', clean(tailoringSearchParams));

    // eslint-disable-next-line
  }, []);

  const { pathname } = useLocation();

  useEffect(() => {
    console.log('Location update', pathname);

    if (modelVariantId && projectTypeVariantId && projectTypeId && projectFeatures) {
      setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...projectFeatures });
    }
  }, [pathname]);

  useEffect(() => {
    console.log('searchParams update', searchParams);
  }, [searchParams]);

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
