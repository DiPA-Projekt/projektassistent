import { Form, Select } from 'antd';
import React, { useEffect, useState } from 'react';

import { ModelVariant } from '@dipa-projekt/projektassistent-openapi';

import axios from 'axios';
import XMLParser from 'react-xml-parser';
import { ProjectTypeVariant } from './projectTypeVariant';
import { useTailoring } from '../../../context/TailoringContext';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

export function ModelVariant() {
  const { modelVariantId, setModelVariantId } = useTailoring();

  const [modelVariantsData, setModelVariantsData] = useState<ModelVariant[]>([]);

  useEffect(() => {
    async function getModelVariantsData() {
      fetchModelVariantsData();
    }

    getModelVariantsData().then();
    //eslint-disable-next-line
  }, []);

  function fetchModelVariantsData(): void {
    axios
      .get('https://vm-api.weit-verein.de/V-Modellmetamodell/mm_2021/V-Modellvariante')
      .then((response) => {
        const jsonDataFromXml = new XMLParser().parseFromString(response.data);

        const modelVariants: ModelVariant[] = jsonDataFromXml
          .getElementsByTagName('V-Modellvariante')
          .map((variante) => {
            const currentAttributes = variante.attributes;
            return { id: currentAttributes.id, name: currentAttributes.name };
          });

        setModelVariantsData(modelVariants);
      })
      .catch(() => 'obligatory catch');
  }

  return (
    <>
      <Form.Item {...layout}>
        <Select
          placeholder="Bitte wählen"
          onChange={(value: string) => {
            setModelVariantId(value);
          }}
          value={modelVariantId}
        >
          {modelVariantsData.map((modelVariant: ModelVariant, index: number) => {
            return (
              <Option value={modelVariant.id} key={`meta-model-${index}`}>
                {modelVariant.name}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      {modelVariantId && <ProjectTypeVariant />}
    </>
  );
}
