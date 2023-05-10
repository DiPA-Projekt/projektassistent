// import { Select } from 'antd';
import React, { useEffect } from 'react';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';

import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { useTailoring } from '../../../context/TailoringContext';
import { decodeXml, removeHtmlTags } from '../../../shares/utils';
import { PopoverComponent } from './popover/component';
import { Form, Select } from 'antd';
import { SelectValue } from 'antd/es/select';
import parse from 'html-react-parser';

const { Option } = Select;

const layout = {
  labelCol: { span: 16 },
  wrapperCol: { span: 8 },
};

interface MyType {
  [key: string]: string;
}

export function ApplicationProfile() {
  const {
    modelVariantId,
    projectFeatures,
    setProjectFeatures,
    projectFeaturesDetails,
    setProjectFeaturesDetails,
    projectFeaturesData,
    // projectFeaturesDataFromProjectTypeVariant,
  } = useTailoring();

  useEffect(() => {
    // console.log('changed', projectFeaturesData);
    if (projectFeaturesData) {
      getProjectFeatureDetails([...projectFeaturesData.fromProjectType, ...projectFeaturesData.fromProjectTypeVariant]);
    }

    //eslint-disable-next-line
  }, [projectFeaturesData]);

  useEffect(() => {
    // async function mount() {
    // console.log('projectFeatures changed', projectFeatures);
    // }
    // mount().then();
    //eslint-disable-next-line
  }, [projectFeatures]);

  useEffect(() => {
    // console.log('useEffect projectFeaturesDetails', projectFeaturesDetails);

    if (projectFeaturesDetails) {
      if (!projectFeatures || Object.keys(projectFeatures).length === 0) {
        const tempArray: MyType = {};
        for (const projectFeature of projectFeaturesDetails) {
          if (projectFeature.values?.selectedValue) {
            tempArray[projectFeature.id] = projectFeature.values.selectedValue;
          }
        }
        setProjectFeatures(tempArray);
      } else {
        // console.log('projectFeatures already set', projectFeatures);
      }
    }
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

  async function getProjectFeatureDetails(combinedProjectFeatures: ProjectFeature[]): Promise<any> {
    const details: ProjectFeature[] = [];

    for (const feature of combinedProjectFeatures) {
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

      const optionsWithAnswer: { key: string; title: string; answer: string }[] = await getOptionsWithAnswer(
        values,
        feature
      );

      const selectedValue =
        projectFeatures && projectFeatures[jsonDataFromXml.attributes.id]
          ? projectFeatures[jsonDataFromXml.attributes.id]
          : defaultValue;

      const projectFeature: ProjectFeature = {
        id: jsonDataFromXml.attributes.id,
        values: {
          selectedValue: selectedValue,
          possibleValues: optionsWithAnswer,
        },
        name: jsonDataFromXml.attributes.name,
        description: removeHtmlTags(decodeXml(question)),
        helpText: removeHtmlTags(decodeXml(description)),
      };

      details.push(projectFeature);
    }

    setProjectFeaturesDetails(details);
  }

  async function getOptionsWithAnswer(
    values: XMLElement[],
    feature: ProjectFeature
  ): Promise<{ key: string; title: string; answer: string }[]> {
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

    resultValues.unshift({
      key: '',
      title: '--',
      answer: '',
    });

    return resultValues;
  }

  function onProjectFeatureSelected(projectFeatureKey: string, value: string) {
    // console.log(projectFeatureKey, value);

    const newProjectFeatures = Object.assign(projectFeatures, { [projectFeatureKey]: value });

    setProjectFeatures(newProjectFeatures);

    // setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...projectFeatures });
  }

  function labelWithPopover(projectFeature: ProjectFeature) {
    return (
      <div>
        <span style={{ marginRight: '5px' }}>{projectFeature.description}</span>
        {projectFeature?.helpText !== undefined && (
          <>
            <PopoverComponent content={projectFeature.helpText} title={projectFeature.name} />
          </>
        )}
      </div>
    );
  }

  function getAnswer(projectFeature: ProjectFeature, value: SelectValue): string | undefined {
    const selectedValue = projectFeature.values?.possibleValues?.find((x: any) => x.key === value);
    return selectedValue?.answer;
  }

  return (
    <>
      {projectFeatures && projectFeaturesDetails.length > 0 && (
        <>
          <h2>Definiere das Anwendungsprofil</h2>
          {projectFeaturesDetails?.map((projectFeature: ProjectFeature) => {
            return (
              // <SelectComponent
              //   key={`${projectFeature.name}-${projectFeature.id}`}
              //   projectFeature={projectFeature}
              //   defaultValue={projectFeatures[projectFeature.id]} // TODO: check
              //   onChange={onProjectFeatureSelected}
              // />
              <Form.Item
                {...layout}
                key={`${projectFeature.name}-${projectFeature.id}`}
                label={labelWithPopover(projectFeature)}
              >
                <Select
                  value={projectFeatures[projectFeature.id]}
                  onChange={(value: string) => {
                    // this.setState({ value: getAnswer(projectFeature, value) });
                    onProjectFeatureSelected(projectFeature.id, value);
                  }}
                >
                  {projectFeature.values?.possibleValues?.map(
                    (value: { key: string; title: string; answer: string }) => (
                      // wir müssen als Key in der API einen anderen Datentyp wählen / oder mappen
                      <Option key={value.key} value={value.key}>
                        {value.title}
                      </Option>
                    )
                  )}
                </Select>
                <div style={{ fontWeight: 500, marginTop: '5px' }}>
                  {parse(decodeXml(getAnswer(projectFeature, projectFeatures[projectFeature.id])))}
                </div>
              </Form.Item>
            );
          })}
        </>
      )}
    </>
  );
}
