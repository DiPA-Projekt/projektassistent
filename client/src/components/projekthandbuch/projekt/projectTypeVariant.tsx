import { Cascader, Form } from 'antd';
import React, { useEffect, useState } from 'react';

import { ProjectFeature, ProjectType, ProjectTypeVariant } from '@dipa-projekt/projektassistent-openapi';

import { useTailoring } from '../../../context/TailoringContext';
import { ApplicationProfile } from './applicationProfile';
import { getJsonDataFromXml } from '../../../shares/utils';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

export function ProjectTypeVariant() {
  const {
    modelVariantId,
    projectTypeVariantId,
    setProjectTypeVariantId,
    setProjectTypeId,
    setProjectFeaturesDataFromProjectTypeVariant,
    setProjectFeaturesDataFromProjectType,
    setSearchParams,
  } = useTailoring();

  const [projectTypeVariantsData, setProjectTypeVariantsData] = useState<ProjectTypeVariant[]>([]);
  const [cascaderOptions, setCascaderOptions] = useState<Option[]>([]);
  const [cascaderDefaultValue, setCascaderDefaultValue] = useState<string[]>([]);
  // const [projectFeaturesDataFromProjectTypeVariant, setProjectFeaturesDataFromProjectTypeVariant] = useState<
  //   ProjectFeature[]
  // >([]);
  // const [projectFeaturesDataFromProjectType, setProjectFeaturesDataFromProjectType] = useState<ProjectFeature[]>([]);

  // const projectTypeIdsMap = new Map();

  useEffect(() => {
    async function getProjectTypeVariantData() {
      console.log('getProjectTypeVariantData', modelVariantId);

      const projectTypeVariants = await fetchProjectTypeVariantData();

      setProjectTypeVariantsData(projectTypeVariants); // TODO projectTypeVariants in getCascaderDefaultArray nicht gesetzt
      if (projectTypeVariantId) {
        const cascaderDefaultArray = getCascaderDefaultArray(projectTypeVariants);
        setCascaderDefaultValue(cascaderDefaultArray);
      }
    }

    getProjectTypeVariantData().then();
    //eslint-disable-next-line
  }, [modelVariantId]);

  useEffect(() => {
    if (projectTypeVariantId) {
      async function getProjectTypeData() {
        void fetchProjectTypeData();
      }

      getProjectTypeData().then();
    }
    //eslint-disable-next-line
  }, [projectTypeVariantId]);

  function getCascaderEntry(projectTypeVariant: ProjectTypeVariant): { key: string; value: string } {
    // TODO: nicht bei ' ' trennen -> z.B. Internes Projekt
    const key = projectTypeVariant.name.substring(0, projectTypeVariant.name.indexOf(' '));
    const value = projectTypeVariant.name.substring(projectTypeVariant.name.indexOf(' ') + 1);
    return { key, value };
  }

  // TODO: Parameter vorher als projectTypeVariantsData... müsste dafür als ref deklariert werden
  function getCascaderDefaultArray(projectTypeVariants: ProjectTypeVariant[]): string[] {
    console.log('getCascaderDefaultArray', projectTypeVariantId);
    if (projectTypeVariantId !== undefined) {
      const foundVariant = projectTypeVariants.find(
        (projectTypeVariant) => projectTypeVariant.id === projectTypeVariantId!
      );
      if (foundVariant) {
        const { key, value } = getCascaderEntry(foundVariant);
        return [key, value];
      }
    }
    return [];
  }

  async function fetchProjectTypeVariantData(): Promise<ProjectTypeVariant[]> {
    const projectTypeVariantsUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttypvariante';

    const jsonDataFromXml: any = await getJsonDataFromXml(projectTypeVariantsUrl);

    const projectTypeVariants: ProjectTypeVariant[] = jsonDataFromXml
      .getElementsByTagName('Projekttypvariante')
      .map((variant: any) => {
        return variant.attributes as ProjectTypeVariant;
      });

    // setProjectTypeVariantsData( []);
    const projectTypeVariantsCascaderOptions: Option[] = [];

    projectTypeVariants.forEach((projectTypeVariant) => {
      const cascaderEntry = getCascaderEntry(projectTypeVariant);

      console.log('key, value', cascaderEntry.key, cascaderEntry.value);

      let optionIndex = projectTypeVariantsCascaderOptions.findIndex((x) => x.value === cascaderEntry.key);

      if (optionIndex === -1) {
        optionIndex =
          projectTypeVariantsCascaderOptions.push({
            value: cascaderEntry.key,
            label: cascaderEntry.key,
            children: [],
          }) - 1;
      }

      projectTypeVariantsCascaderOptions[optionIndex].children!.push({
        value: projectTypeVariant.id,
        label: cascaderEntry.value,
      });

      // projectTypeVariantsCascaderOptions.push(option);
    });

    console.log('projectTypeVariantsCascaderOptions', projectTypeVariantsCascaderOptions);

    setCascaderOptions(projectTypeVariantsCascaderOptions);

    return projectTypeVariants;
    // setProjectTypeVariantsData(projectTypeVariants); // TODO projectTypeVariants in getCascaderDefaultArray nicht gesetzt
    // if (projectTypeVariantId) {
    //   const cascaderDefaultArray = getCascaderDefaultArray();
    //   setCascaderDefaultValue(cascaderDefaultArray);
    // }
  }

  async function fetchProjectTypeData(): Promise<void> {
    // setProjectTypeVariantId(projectTypeVariantId);

    const projectTypeVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    // get projectTypeId, projectFeaturesDataFromProjectType and projectFeaturesDataFromProjectTypeVariant
    const jsonDataFromXml: any = await getJsonDataFromXml(projectTypeVariantUrl);

    const projectType: ProjectType = jsonDataFromXml.getElementsByTagName('ProjekttypRef')[0]
      ?.attributes as ProjectType;

    console.log('test');

    // setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectType.id });
    // setProjectTypeVariantId(projectTypeVariantId);
    // setProjectTypeId(projectType.id);

    ////////////////////////////////////////////////////////////////

    const projectFeaturesFromProjectTypeVariant: ProjectFeature[] = jsonDataFromXml
      .getElementsByTagName('ProjektmerkmalRef')
      .map((feature: any) => {
        return feature.attributes as ProjectFeature;
      });

    setProjectFeaturesDataFromProjectTypeVariant(projectFeaturesFromProjectTypeVariant);
    console.log('setProjectFeaturesDataFromProjectTypeVariant', projectFeaturesFromProjectTypeVariant);

    ////////////////////////////////////////////////////////////////

    void fetchProjectFeaturesDataFromProjectType(projectType.id);
  }

  async function fetchProjectFeaturesDataFromProjectType(projectTypeId: string): Promise<void> {
    const projectTypeUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      modelVariantId +
      '/Projekttyp/' +
      projectTypeId;

    const jsonDataFromXml: any = await getJsonDataFromXml(projectTypeUrl);

    const projectFeaturesFromProjectType: ProjectFeature[] = jsonDataFromXml
      .getElementsByTagName('ProjektmerkmalRef')
      .map((feature: any) => {
        return feature.attributes as ProjectFeature;
      });

    setProjectTypeId(projectTypeId); // TODO: andere Stelle besser?
    setProjectFeaturesDataFromProjectType(projectFeaturesFromProjectType);
    console.log('setProjectFeaturesDataFromProjectType', projectFeaturesFromProjectType);
  }

  return (
    <>
      {projectTypeVariantsData.length > 0 && (
        <>
          <h2>Wähle die Projekttypvariante</h2>
          <Form.Item {...layout}>
            <Cascader
              options={cascaderOptions}
              onChange={(value: any /*CascaderValueType*/) => {
                console.log('changed projectTypeVarinatId manually');
                setProjectTypeVariantId(value[1]);
                setSearchParams({ mV: modelVariantId, ptV: value[1] });
                // setSearchParams({ mV: modelVariantId!, ptV: value[1] });
              }}
              value={cascaderDefaultValue}
              placeholder="Bitte wählen"
            />
          </Form.Item>
          {projectTypeVariantId && <ApplicationProfile />}
        </>
      )}
    </>
  );
}
