import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { clean } from '../shares/utils';

interface MyType {
  [key: string]: string;
}

interface TailoringParameter {
  modelVariantId?: string;
  projectTypeVariantId?: string;
  projectTypeId?: string;
  projectFeatures?: MyType;
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
  tailoringParameter: TailoringParameter;
  setTailoringParameter: Function;
  redirectIfTailoringNotComplete: Function;
};

type TailoringSessionProviderProps = { children: React.ReactNode };

const TailoringSessionContext = React.createContext<TailoringSession | undefined>(undefined);

const TailoringSessionContextProvider = ({ children }: TailoringSessionProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const [projectFeaturesDetails, setProjectFeaturesDetails] = React.useState<ProjectFeature[]>([]);

  const [tailoringParameter, setTailoringParameter] = useState<TailoringParameter>({});

  const [modelVariantId, setModelVariantId] = useState<string | null>(null);
  const [projectTypeVariantId, setProjectTypeVariantId] = useState<string | null>(null);
  const [projectTypeId, setProjectTypeId] = useState<string | null>(null);
  const [projectFeatures, setProjectFeatures] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    console.log('TailoringContext useEffect tailoringParameter', tailoringParameter);

    const searchParams = {
      mV: tailoringParameter.modelVariantId,
      ptV: tailoringParameter.projectTypeVariantId,
      pt: tailoringParameter.projectTypeId,
      ...tailoringParameter.projectFeatures,
    };
    // if (searchParams != null) {
    // TODO
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
    redirectIfTailoringNotComplete,
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

  function isTailoringParameterMissing(parameter: TailoringParameter): boolean {
    return (
      parameter.modelVariantId === undefined ||
      parameter.projectTypeVariantId === undefined ||
      parameter.projectTypeId === undefined ||
      parameter.projectFeatures === undefined
    );
  }

  function redirectIfTailoringNotComplete(parameter: TailoringParameter) {
    if (isTailoringParameterMissing(parameter)) {
      navigate('/tailoring', { replace: true });
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
      modelVariantId: searchParams.get('mV') ?? undefined,
      projectTypeVariantId: searchParams.get('ptV') ?? undefined,
      projectTypeId: searchParams.get('pt') ?? undefined,
    };

    const cleanedTailoringSearchParams = clean(tailoringSearchParams);

    const cleanedTailoringSearchParamsWithProjectFeatures = Object.assign(cleanedTailoringSearchParams, {
      projectFeatures: projectFeatureIdsSearchParam,
    });
    setTailoringParameter(cleanedTailoringSearchParamsWithProjectFeatures);

    redirectIfTailoringNotComplete(cleanedTailoringSearchParamsWithProjectFeatures);

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
