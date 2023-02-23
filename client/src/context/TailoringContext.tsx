import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface MyType {
  [key: string]: string;
}

type TailoringSession = {
  setSearchParams: Function;
  projectFeaturesDetails: ProjectFeature[];
  setProjectFeaturesDetails: Function;
  projectFeaturesDataFromProjectTypeVariant: ProjectFeature[];
  setProjectFeaturesDataFromProjectTypeVariant: Function;
  projectFeaturesDataFromProjectType: ProjectFeature[];
  setProjectFeaturesDataFromProjectType: Function;
  modelVariantId: string | null;
  setModelVariantId: Function;
  projectTypeVariantId: string | null;
  setProjectTypeVariantId: Function;
  projectTypeId: string | null;
  setProjectTypeId: Function;
  projectFeatureIds: { [key: string]: string } | null;
  setProjectFeatureIds: Function;
  projectFeatures: { [key: string]: string } | null;
  setProjectFeatures: Function;
};

type TailoringSessionProviderProps = { children: React.ReactNode };

const TailoringSessionContext = React.createContext<TailoringSession | undefined>(undefined);

const TailoringSessionContextProvider = ({ children }: TailoringSessionProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projectFeaturesDetails, setProjectFeaturesDetails] = React.useState<ProjectFeature[]>([]);
  const [projectFeaturesDataFromProjectTypeVariant, setProjectFeaturesDataFromProjectTypeVariant] = React.useState<
    ProjectFeature[]
  >([]);
  const [projectFeaturesDataFromProjectType, setProjectFeaturesDataFromProjectType] = React.useState<ProjectFeature[]>(
    []
  );

  const [modelVariantId, setModelVariantId] = useState<string | null>(null);

  const [projectTypeVariantId, _setProjectTypeVariantId] = useState<string | null>(null);
  function setProjectTypeVariantId(newProjectTypeVariantId: string | null) {
    _setProjectTypeVariantId(newProjectTypeVariantId);
    // TODO, wenn null, dann dürfen die Werte jeweils nicht gesetzt werden

    // const searchParams = { mV: modelVariantId, ptV: newProjectTypeVariantId, pt: projectTypeId };
    // if (searchParams != null) {
    // setSearchParams(clean(searchParams));
    // }
    // console.log('searchParams after', searchParams);

    setProjectFeaturesDataFromProjectTypeVariant([]);
    setProjectFeaturesDataFromProjectType([]);
    //setProjectTypeId(null); // TODO ist eigentlich nicht nötig, weil es auch
  }

  const [projectTypeId, setProjectTypeId] = useState<string | null>(null);
  // TODO: projectFeatureIds
  const [projectFeatureIds, setProjectFeatureIds] = useState<MyType | null>(null);
  const [projectFeatures, setProjectFeatures] = useState<{ [key: string]: string } | null>(null);

  const value: TailoringSession = {
    setSearchParams,
    projectFeaturesDetails,
    setProjectFeaturesDetails,
    projectFeaturesDataFromProjectTypeVariant,
    setProjectFeaturesDataFromProjectTypeVariant,
    projectFeaturesDataFromProjectType,
    setProjectFeaturesDataFromProjectType,
    modelVariantId,
    setModelVariantId,
    projectTypeVariantId,
    setProjectTypeVariantId,
    projectTypeId,
    setProjectTypeId,
    projectFeatureIds,
    setProjectFeatureIds,
    projectFeatures,
    setProjectFeatures,
  };

  useEffect(() => {
    const modelVariantIdSearchParam = searchParams.get('mV');
    console.log('modelVariantId on mount', modelVariantIdSearchParam);
    const projectTypeVariantIdSearchParam = searchParams.get('ptV');
    const projectTypeIdSearchParam = searchParams.get('pt');
    const projectFeatureIdsSearchParam: MyType = {};

    if (modelVariantIdSearchParam) {
      setModelVariantId(modelVariantIdSearchParam);
    }
    setProjectTypeVariantId(projectTypeVariantIdSearchParam);
    setProjectTypeId(projectTypeIdSearchParam);

    searchParams.forEach((value, key) => {
      if (!['mV', 'ptV', 'pt'].includes(key)) {
        projectFeatureIdsSearchParam[key] = value;
      }
    });

    setProjectFeatureIds(projectFeatureIdsSearchParam);

    // eslint-disable-next-line
  }, []);

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
