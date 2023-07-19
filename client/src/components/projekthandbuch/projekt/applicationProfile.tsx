import React, { useEffect } from 'react';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';

import axios from 'axios';
import XMLParser, { XMLElement } from 'react-xml-parser';
import { useTailoring } from '../../../context/TailoringContext';
import { decodeXml, getJsonDataFromXml, removeHtmlTags } from '../../../shares/utils';
import { PopoverComponent } from './popover/component';
import { Button, Card, Form, Select } from 'antd';
import { SelectValue } from 'antd/es/select';
import parse from 'html-react-parser';
import { weitApiUrl } from '../../app/App';
import { LinkWithQuery } from '../../LinkWithQuery';

const { Option } = Select;

interface MyType {
  [key: string]: string;
}

interface ProjectFeatureStringOption {
  key: string;
  title: string;
  answer: string;
}

export function ApplicationProfile() {
  const { tailoringParameter, setTailoringParameter, projectFeaturesDetails, setProjectFeaturesDetails } =
    useTailoring();

  const [projectFeaturesData, setProjectFeaturesData] = React.useState<{
    fromProjectType: ProjectFeature[];
    fromProjectTypeVariant: ProjectFeature[];
  }>();

  useEffect(() => {
    async function getProjectFeaturesData() {
      if (tailoringParameter.projectTypeVariantId) {
        const projectFeaturesFromProjectTypeVariant = await fetchProjectTypeData();
        const projectTypeId = await getProjectTypeId();
        const projectFeaturesFromProjectType = await fetchProjectFeaturesDataFromProjectType(projectTypeId);

        setProjectFeaturesData({
          fromProjectType: projectFeaturesFromProjectType,
          fromProjectTypeVariant: projectFeaturesFromProjectTypeVariant,
        });
      }
    }

    void getProjectFeaturesData().then();
    //eslint-disable-next-line
  }, [tailoringParameter.projectTypeVariantId]);

  async function fetchProjectFeaturesDataFromProjectType(projectTypeId: string): Promise<ProjectFeature[]> {
    const projectTypeUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttyp/' +
      projectTypeId;

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeUrl);

    return jsonDataFromXml.getElementsByTagName('ProjektmerkmalRef').map((feature: any) => {
      return feature.attributes as ProjectFeature;
    });
  }

  async function fetchProjectTypeData(): Promise<ProjectFeature[]> {
    const projectTypeVariantUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId;

    const jsonDataFromXml = await getJsonDataFromXml(projectTypeVariantUrl);

    return jsonDataFromXml.getElementsByTagName('ProjektmerkmalRef').map((feature) => {
      return {
        id: feature.attributes.id,
        name: feature.attributes.name,
      } as ProjectFeature;
    });
  }

  async function getProjectTypeId(): Promise<string> {
    const projectTypeVariantUrl =
      weitApiUrl +
      '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      tailoringParameter.modelVariantId +
      '/Projekttypvariante/' +
      tailoringParameter.projectTypeVariantId;

    // get projectTypeId, projectFeaturesDataFromProjectType and projectFeaturesDataFromProjectTypeVariant
    const jsonDataFromXml = await getJsonDataFromXml(projectTypeVariantUrl);

    const projectType = jsonDataFromXml.getElementsByTagName('ProjekttypRef')[0];

    return projectType?.attributes.id;
  }

  useEffect(() => {
    async function projectFeaturesDataChanged() {
      await getProjectFeatureDetails(projectFeaturesData);
    }

    void projectFeaturesDataChanged().then();

    //eslint-disable-next-line
  }, [projectFeaturesData]);

  useEffect(() => {
    if (Object.keys(projectFeaturesDetails).length > 0) {
      const tempArray: MyType = {};
      for (const projectFeature of projectFeaturesDetails) {
        if (projectFeature.values?.selectedValue) {
          // set default value if tailoring parameter is not set
          const currentValue =
            tailoringParameter.projectFeatures?.[projectFeature.id] !== undefined
              ? tailoringParameter.projectFeatures?.[projectFeature.id]
              : projectFeature.values.selectedValue;
          tempArray[projectFeature.id] = currentValue;
        }
      }
      let result = Object.assign({}, tailoringParameter);
      result = Object.assign(result, { projectFeatures: tempArray });
      setTailoringParameter(result);
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
          weitApiUrl +
          '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
          tailoringParameter.modelVariantId +
          '/Projektmerkmal/' +
          feature.id;

        const jsonDataFromXml = await getJsonDataFromXml(projectFeatureUrl);

        if (jsonDataFromXml) {
          const question = jsonDataFromXml.getElementsByTagName('Frage')[0]?.value;
          const description = jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
          const defaultValue = jsonDataFromXml.getElementsByTagName('StandardwertRef')[0]?.attributes.id;

          const values = jsonDataFromXml.getElementsByTagName('Wert');

          const optionsWithAnswer: ProjectFeatureStringOption[] = await getOptionsWithAnswer(values, feature);

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
      }

      setProjectFeaturesDetails(details);
    }
  }

  async function getOptionsWithAnswer(
    values: XMLElement[],
    feature: ProjectFeature
  ): Promise<ProjectFeatureStringOption[]> {
    const resultValues = [];

    for (const value of values) {
      const valueUrl =
        weitApiUrl +
        '/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        tailoringParameter.modelVariantId +
        '/Projektmerkmal/' +
        feature.id +
        '/Wert/' +
        value.attributes.id;

      const result: ProjectFeatureStringOption = await axios.get(valueUrl).then((valueResponse) => {
        const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data as string);
        const valueDescription = valueJsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;

        return {
          key: value.attributes.id,
          title: value.attributes.name,
          answer: `<div style="margin-right: 15px;">ᐅ ${value.attributes.name}: </div>${valueDescription}`,
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

  function getAnswer(projectFeature: ProjectFeature, value: SelectValue): string | undefined {
    const selectedValue = projectFeature.values?.possibleValues?.find((x: any) => x.key === value);
    return selectedValue?.answer;
  }

  return (
    <>
      {tailoringParameter.projectFeatures && projectFeaturesDetails.length > 0 && (
        <>
          <Card
            title={<h2>Definiere das Anwendungsprofil</h2>}
            style={{ maxWidth: 800, backgroundColor: '#fffaf0 !important' }}
          >
            {projectFeaturesDetails?.map((projectFeature: ProjectFeature) => {
              return (
                <Form.Item key={`${projectFeature.name}-${projectFeature.id}`}>
                  <Card
                    className="multirow"
                    title={<div style={{ fontSize: '14px', fontWeight: 'normal' }}>{projectFeature.description}</div>}
                    extra={<PopoverComponent content={projectFeature.helpText} title={projectFeature.name} />}
                    style={{ maxWidth: 800, backgroundColor: '#fffaf0 !important' }}
                  >
                    <Select
                      style={{ maxWidth: '300px' }}
                      value={tailoringParameter.projectFeatures[projectFeature.id]}
                      onChange={(value: string) => {
                        // this.setState({ value: getAnswer(projectFeature, value) });
                        onProjectFeatureSelected(projectFeature.id, value);
                      }}
                    >
                      {projectFeature.values?.possibleValues?.map((value: ProjectFeatureStringOption) => (
                        // wir müssen als Key in der API einen anderen Datentyp wählen / oder mappen
                        <Option key={value.key} value={value.key}>
                          {value.title}
                        </Option>
                      ))}
                    </Select>
                    <div style={{ fontWeight: 700, marginTop: '10px' }}>
                      {parse(
                        decodeXml(getAnswer(projectFeature, tailoringParameter.projectFeatures[projectFeature.id]))
                      )}
                    </div>
                  </Card>
                </Form.Item>
              );
            })}
          </Card>
          <LinkWithQuery to="/documentation">
            <Button type="primary" htmlType="button" style={{ marginTop: '20px' }}>
              Generiere Dokumentation
            </Button>
          </LinkWithQuery>
        </>
      )}
    </>
  );
}
