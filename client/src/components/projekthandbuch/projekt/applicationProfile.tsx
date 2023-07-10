// import { Select } from 'antd';
import React, { useEffect } from 'react';

import { ProjectFeature, ProjectType } from '@dipa-projekt/projektassistent-openapi';

import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { useTailoring } from '../../../context/TailoringContext';
import { decodeXml, getJsonDataFromXml, removeHtmlTags } from '../../../shares/utils';
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
  // const {
  //   modelVariantId,
  //   projectFeatures,
  //   setProjectFeatures,
  //   projectFeaturesDetails,
  //   setProjectFeaturesDetails,
  //   projectFeaturesData,
  //   // projectFeaturesDataFromProjectTypeVariant,
  // } = useTailoring();
  const { tailoringParameter, setTailoringParameter, projectFeaturesDetails, setProjectFeaturesDetails } =
    useTailoring();

  const [projectFeaturesData, setProjectFeaturesData] = React.useState<{
    fromProjectType: ProjectFeature[];
    fromProjectTypeVariant: ProjectFeature[];
  }>();

  useEffect(() => {
    async function getProjectFeaturesData() {
      if (tailoringParameter.projectTypeVariantId) {
        // TODO: check if still necessary in getProjectTypeVariantData
        // const cascaderDefaultArray = getCascaderDefaultArray(projectTypeVariantsData);
        // setCascaderDefaultValue(cascaderDefaultArray);
        const projectFeaturesFromProjectTypeVariant = await fetchProjectTypeData();

        const projectTypeId = await getProjectTypeId();

        const projectFeaturesFromProjectType = await fetchProjectFeaturesDataFromProjectType(projectTypeId);

        // TODO
        console.log('getProjectTypeData setProjectFeaturesData -> ', {
          fromProjectType: projectFeaturesFromProjectType,
          fromProjectTypeVariant: projectFeaturesFromProjectTypeVariant,
        });
        setProjectFeaturesData({
          fromProjectType: projectFeaturesFromProjectType,
          fromProjectTypeVariant: projectFeaturesFromProjectTypeVariant,
        });
      }
    }

    getProjectFeaturesData().then();
    //eslint-disable-next-line
  }, [tailoringParameter.projectTypeVariantId]);

  async function fetchProjectFeaturesDataFromProjectType(projectTypeId: string): Promise<ProjectFeature[]> {
    const projectTypeUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      projectTypeId;

    const jsonDataFromXml: any = await getJsonDataFromXml(projectTypeUrl);

    return jsonDataFromXml.getElementsByTagName('ProjektmerkmalRef').map((feature: any) => {
      return feature.attributes as ProjectFeature;
    });
  }

  async function fetchProjectTypeData(): Promise<ProjectFeature[]> {
    const projectTypeVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId;

    const jsonDataFromXml: any = await getJsonDataFromXml(projectTypeVariantUrl);

    return jsonDataFromXml.getElementsByTagName('ProjektmerkmalRef').map((feature: any) => {
      return feature.attributes as ProjectFeature;
    });
  }

  async function getProjectTypeId(): Promise<string> {
    const projectTypeVariantUrl =
      'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId;

    // get projectTypeId, projectFeaturesDataFromProjectType and projectFeaturesDataFromProjectTypeVariant
    const jsonDataFromXml: any = await getJsonDataFromXml(projectTypeVariantUrl);

    const projectType: ProjectType = jsonDataFromXml.getElementsByTagName('ProjekttypRef')[0]
      ?.attributes as ProjectType;

    //setProjectTypeId(projectType.id); // TODO

    return projectType.id;
  }

  useEffect(() => {
    console.log('projectFeaturesData changed', projectFeaturesData);
    // if (projectFeaturesData) {
    getProjectFeatureDetails(projectFeaturesData);
    // }

    //eslint-disable-next-line
  }, [projectFeaturesData]);

  useEffect(() => {
    // async function mount() {
    console.log('projectFeatures changed', tailoringParameter.projectFeatures);
    // }
    // mount().then();
    //eslint-disable-next-line
  }, [tailoringParameter.projectFeatures]);

  useEffect(() => {
    // console.log('useEffect projectFeaturesDetails', projectFeaturesDetails);

    // TODO: check if this is the way
    if (Object.keys(projectFeaturesDetails).length > 0) {
      // if (!tailoringParameter.projectFeatures || Object.keys(tailoringParameter.projectFeatures).length === 0) {
      const tempArray: MyType = {};
      for (const projectFeature of projectFeaturesDetails) {
        if (projectFeature.values?.selectedValue) {
          tempArray[projectFeature.id] = projectFeature.values.selectedValue;
        }
      }
      // TODO: check
      let result = Object.assign({}, tailoringParameter);
      result = Object.assign(result, { projectFeatures: tempArray });
      console.log('ATTENTION onProjectFeatureSelected', result);
      setTailoringParameter(result);
      // } else {
      // console.log('projectFeatures already set', projectFeatures);
      // }
    }
    //eslint-disable-next-line
  }, [projectFeaturesDetails]);

  // TODO TODO TODO
  // useEffect(() => {
  //   // console.log('useEffect projectFeaturesDetails', projectFeaturesDetails);
  //
  //   if (projectFeaturesDetails) {
  //     // if (!tailoringParameter.projectFeatures || Object.keys(tailoringParameter.projectFeatures).length === 0) {
  //     const tempArray: MyType = {};
  //     for (const projectFeature of projectFeaturesDetails) {
  //
  //       const selectedFeatureValue = tailoringParameter.projectFeatures[projectFeature.id]
  //
  //
  //       // if (projectFeature.values?.selectedValue) {
  //         tempArray[projectFeature.id] = selectedFeatureValue ?? projectFeature.values.selectedValue;
  //       // }
  //     }
  //     // TODO: check
  //     let result = Object.assign({}, tailoringParameter);
  //     result = Object.assign(result, { projectFeatures: tempArray });
  //     setTailoringParameter(result);
  //     // } else {
  //     // console.log('projectFeatures already set', projectFeatures);
  //     // }
  //   }
  //   //eslint-disable-next-line
  // }, [tailoringParameter.projectFeatures]);

  // useEffect(() => {
  //   console.log('useEffect projectFeatures', projectFeatures);
  //
  //   console.log('test3');
  //   setSearchParams({ mV: modelVariantId!, ptV: projectTypeVariantId!, pt: projectTypeId!, ...projectFeatures });
  //
  //   //eslint-disable-next-line
  // }, [projectFeatures]);

  async function getProjectFeatureDetails(
    projectFeaturesData:
      | {
          fromProjectType: ProjectFeature[];
          fromProjectTypeVariant: ProjectFeature[];
        }
      | undefined
  ): Promise<any> {
    if (projectFeaturesData === undefined) {
      setProjectFeaturesDetails([]);
    } else {
      const combinedProjectFeatures = [
        ...projectFeaturesData.fromProjectType,
        ...projectFeaturesData.fromProjectTypeVariant,
      ];

      const details: ProjectFeature[] = [];

      for (const feature of combinedProjectFeatures) {
        const projectFeatureUrl =
          'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
          tailoringParameter.modelVariantId +
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

        // console.log('getProjectFeatureDetails', tailoringParameter.projectFeatures[jsonDataFromXml.attributes.id]);

        // const selectedValue =
        //   tailoringParameter.projectFeatures && tailoringParameter.projectFeatures[jsonDataFromXml.attributes.id]
        //     ? tailoringParameter.projectFeatures[jsonDataFromXml.attributes.id]
        //     : defaultValue;

        const selectedValue = defaultValue;

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
  }

  async function getOptionsWithAnswer(
    values: XMLElement[],
    feature: ProjectFeature
  ): Promise<{ key: string; title: string; answer: string }[]> {
    const resultValues = [];

    for (const value of values) {
      const valueUrl =
        'https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
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

    const newProjectFeatures = Object.assign(tailoringParameter.projectFeatures, { [projectFeatureKey]: value });

    let result = Object.assign({}, tailoringParameter);
    result = Object.assign(result, { projectFeatures: newProjectFeatures });
    console.log('ATTENTION onProjectFeatureSelected', result);
    setTailoringParameter(result);

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
      {tailoringParameter.projectFeatures && projectFeaturesDetails.length > 0 && (
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
                  value={tailoringParameter.projectFeatures[projectFeature.id]}
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
                  {parse(decodeXml(getAnswer(projectFeature, tailoringParameter.projectFeatures[projectFeature.id])))}
                </div>
              </Form.Item>
            );
          })}
        </>
      )}
    </>
  );
}
