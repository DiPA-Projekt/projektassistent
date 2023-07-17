import { Cascader, Form } from 'antd';
import React, { useEffect, useState } from 'react';

import { ProjectType, ProjectTypeVariant } from '@dipa-projekt/projektassistent-openapi';

import { useTailoring } from '../../../context/TailoringContext';
import { ApplicationProfile } from './applicationProfile';
import { getJsonDataFromXml } from '../../../shares/utils';
import { useTranslation } from 'react-i18next';
import { weitApiUrl } from '../../app/App';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

export function ProjectTypeVariantComponent() {
  const { t } = useTranslation();

  const { tailoringParameter, setTailoringParameter } = useTailoring();

  const [projectTypeVariantsData, setProjectTypeVariantsData] = useState<ProjectTypeVariant[]>([]);
  const [cascaderOptions, setCascaderOptions] = useState<Option[]>([]);
  const [cascaderDefaultValue, setCascaderDefaultValue] = useState<string[]>([]);

  useEffect(() => {
    async function getProjectTypeVariantData() {
      const projectTypeVariants = await fetchProjectTypeVariantData();
      setProjectTypeVariantsData(projectTypeVariants);
    }

    void getProjectTypeVariantData().then();
    //eslint-disable-next-line
  }, [tailoringParameter.modelVariantId]);

  useEffect(() => {
    if (tailoringParameter.projectTypeVariantId && projectTypeVariantsData) {
      const cascaderDefaultArray = getCascaderDefaultArray(projectTypeVariantsData);
      setCascaderDefaultValue(cascaderDefaultArray);
    } else {
      setCascaderDefaultValue([]);
    }

    //eslint-disable-next-line
  }, [tailoringParameter.projectTypeVariantId, projectTypeVariantsData]);

  function getCascaderEntry(projectTypeVariant: ProjectTypeVariant): { key: string; value: string } {
    const key = projectTypeVariant.name.substring(0, projectTypeVariant.name.toLowerCase().indexOf('projekt') + 7);
    const value = projectTypeVariant.name.substring(projectTypeVariant.name.toLowerCase().indexOf('projekt') + 8);
    return { key, value };
  }

  // TODO: Parameter vorher als projectTypeVariantsData... müsste dafür als ref deklariert werden
  function getCascaderDefaultArray(projectTypeVariants: ProjectTypeVariant[]): string[] {
    if (tailoringParameter.projectTypeVariantId !== undefined) {
      const foundVariant = projectTypeVariants.find(
        (projectTypeVariant) => projectTypeVariant.id === tailoringParameter.projectTypeVariantId!
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
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante';

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeVariantsUrl);

    const projectTypeVariants: ProjectTypeVariant[] = jsonDataFromXml
      .getElementsByTagName('Projekttypvariante')
      .map((variant: any) => {
        return variant.attributes as ProjectTypeVariant;
      });

    const projectTypeVariantsCascaderOptions: Option[] = [];

    projectTypeVariants.forEach((projectTypeVariant) => {
      const cascaderEntry = getCascaderEntry(projectTypeVariant);

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
    });

    setCascaderOptions(projectTypeVariantsCascaderOptions);

    return projectTypeVariants;
  }

  async function getProjectTypeId(projectTypeVariantId: string): Promise<string> {
    const projectTypeVariantUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    // get projectTypeId, projectFeaturesDataFromProjectType and projectFeaturesDataFromProjectTypeVariant
    const jsonDataFromXml = await getJsonDataFromXml(projectTypeVariantUrl);

    const projectType: ProjectType = jsonDataFromXml.getElementsByTagName('ProjekttypRef')[0]
      ?.attributes as ProjectType;

    return projectType.id;
  }

  return (
    <>
      {projectTypeVariantsData.length > 0 && (
        <>
          <h2>Wähle die Projekttypvariante</h2>
          <Form.Item {...layout}>
            <Cascader
              options={cascaderOptions}
              onChange={async (value: any /*CascaderValueType*/) => {
                console.log('ATTENTION changing projectTypeVariantId', value);
                setTailoringParameter({
                  modelVariantId: tailoringParameter.modelVariantId,
                  projectTypeVariantId: value[1],
                  projectTypeId: await getProjectTypeId(value[1]),
                });
              }}
              value={cascaderDefaultValue}
              placeholder={t('common.PleaseChoose')}
            />
          </Form.Item>
          {tailoringParameter.projectTypeVariantId && <ApplicationProfile />}
        </>
      )}
    </>
  );
}
