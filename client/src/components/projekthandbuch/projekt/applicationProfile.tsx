// import { Select } from 'antd';
import React, { useEffect } from 'react';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';

import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
// import { useSearchParams } from 'react-router-dom';
import { SelectComponent } from './select/component';
import { useTailoring } from '../../../context/TailoringContext';
import { decodeXml, removeHtmlTags } from '../../../shares/utils';

// const { Option } = Select;
//
// const layout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 8 },
// };

interface MyType {
  [key: string]: string;
}

export function ApplicationProfile() {
  // const [searchParams, setSearchParams] = useSearchParams();
  // const modelVariantId = searchParams.get('mV');
  // const projectTypeVariantId = searchParams.get('ptV');
  // const projectTypeId = searchParams.get('pt');
  const projectFeatureIds: MyType = {};

  const {
    setSearchParams,
    projectFeaturesDetails,
    setProjectFeaturesDetails,
    projectFeaturesDataFromProjectType,
    projectFeaturesDataFromProjectTypeVariant,
    modelVariantId,
    // setModelVariantId,
    projectTypeVariantId,
    // setProjectTypeVariantId,
    projectTypeId,
    // setProjectTypeId,
    projectFeatures,
    setProjectFeatures,
  } = useTailoring();

  useEffect(() => {
    // async function mount() {
    getProjectFeatureDetails([...projectFeaturesDataFromProjectType, ...projectFeaturesDataFromProjectTypeVariant]);
    // }

    // mount().then();
    //eslint-disable-next-line
  }, [projectFeaturesDataFromProjectType, projectFeaturesDataFromProjectTypeVariant]);

  useEffect(() => {
    console.log('useEffect projectFeaturesDetails', projectFeaturesDetails);

    const tempArray: MyType = {};

    for (const projectFeature of projectFeaturesDetails) {
      // const projectFeatureUrlParam = projectFeatureIds[projectFeature.id];
      // if (projectFeatureUrlParam) {
      //   tempArray[projectFeature.id] = projectFeatureUrlParam;
      // }
      // projectFeature.values.selectedValue = projectFeatureUrlParam;
      // else
      if (projectFeature.values?.selectedValue) {
        tempArray[projectFeature.id] = projectFeature.values.selectedValue;
      }
    }

    setProjectFeatures(tempArray);

    //eslint-disable-next-line
  }, [projectFeaturesDetails]);

  // useEffect(() => {
  //   console.log('useEffect projectFeatures', projectFeatures);
  //
  //   console.log('test3');
  //   setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...projectFeatures });
  //
  //   //eslint-disable-next-line
  // }, [projectFeatures]);

  async function getProjectFeatureDetails(projectFeatures: ProjectFeature[]): Promise<any> {
    const temporaryArray = [];

    for (const feature of projectFeatures) {
      const projectFeatureUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        modelVariantId +
        '/Projektmerkmal/' +
        feature.id;

      const jsonDataFromXml: any = await axios
        .get(projectFeatureUrl)
        .then((response) => {
          return new XMLParser().parseFromString(response.data);
        })
        .catch(() => 'obligatory catch');

      const question = jsonDataFromXml.getElementsByTagName('Frage')[0]?.value;
      const description = jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
      const defaultValue = jsonDataFromXml.getElementsByTagName('StandardwertRef')[0]?.attributes.id;

      const values = jsonDataFromXml.getElementsByTagName('Wert');

      const answers = await getOptionWithAnswer(values, feature);

      // console.log('111', jsonDataFromXml.attributes.id, searchParams.get(jsonDataFromXml.attributes.id));

      const projectFeature: ProjectFeature = {
        id: jsonDataFromXml.attributes.id,
        values: {
          selectedValue:
            projectFeatureIds[jsonDataFromXml.attributes.id] ||
            // searchParams.get(jsonDataFromXml.attributes.id) ||
            defaultValue,
          possibleValues: answers,
        },
        name: jsonDataFromXml.attributes.name,
        description: removeHtmlTags(decodeXml(question)),
        helpText: removeHtmlTags(decodeXml(description)),
      };

      temporaryArray.push(projectFeature);
    }

    setProjectFeaturesDetails(temporaryArray);
  }

  async function getOptionWithAnswer(values: XMLElement[], feature: ProjectFeature) {
    // const promises: Promise<{ key: string; title: string; answer: string }>[] = [];

    const resultValues = [];

    for (const value of values) {
      const valueUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        modelVariantId +
        '/Projektmerkmal/' +
        feature.id +
        '/Wert/' +
        value.attributes.id;

      const result: { key: string; title: string; answer: string } = await axios.get(valueUrl).then((valueResponse) => {
        const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data);
        const valueDescription = valueJsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;

        return {
          key: value.attributes.id,
          title: value.attributes.name,
          answer: `<div style="float: left; margin-right: 5px;">ᐅ ${value.attributes.name}: </div>${valueDescription}`,
        };
      });
      resultValues.push(result);
    }

    // return await Promise.all(promises).then((values) => {
    resultValues.unshift({
      key: '',
      title: '--',
      answer: '',
    });

    return resultValues;
    // return values;
    // });
  }

  function onProjectFeatureSelected(projectFeatureKey: string, value: string) {
    console.log(projectFeatureKey, value);
    // setSearchParams({ [key]: value });
    // setProjectFeatures[projectFeatureKey]: value;

    setProjectFeatures((oldEntries: { [key: string]: string }) => {
      return { ...oldEntries, [projectFeatureKey]: value };
    });

    setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...projectFeatures });
  }

  return (
    <>
      {projectFeaturesDetails.length > 0 && (
        <>
          <h2>Definiere das Anwendungsprofil</h2>
          {projectFeaturesDetails?.map((projectFeature: ProjectFeature) => {
            return (
              <SelectComponent
                key={`${projectFeature.name}-${projectFeature.id}`}
                projectFeature={projectFeature}
                defaultValue={projectFeatureIds[projectFeature.id]}
                onChange={onProjectFeatureSelected}
              />
            );
          })}
        </>
      )}
    </>
  );
}
