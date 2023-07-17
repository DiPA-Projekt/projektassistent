import { Form, Select } from 'antd';
import React, { useEffect, useState } from 'react';

import { ModelVariant } from '@dipa-projekt/projektassistent-openapi';
import { ProjectTypeVariantComponent } from './projectTypeVariant';
import { useTailoring } from '../../../context/TailoringContext';
import { useTranslation } from 'react-i18next';
import { weitApiUrl } from '../../app/App';
import { getJsonDataFromXml } from '../../../shares/utils';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

export function ModelVariantComponent() {
  const { t } = useTranslation();

  const { tailoringParameter, setTailoringParameter } = useTailoring();

  const [modelVariantsData, setModelVariantsData] = useState<ModelVariant[]>([]);

  useEffect(() => {
    async function getModelVariantsData() {
      await fetchModelVariantsData();
    }

    void getModelVariantsData().then();
    //eslint-disable-next-line
  }, []);

  async function fetchModelVariantsData(): Promise<void> {
    const modelVariantsUrl = weitApiUrl + '/V-Modellmetamodell/mm_2021/V-Modellvariante';

    const jsonDataFromXml = await getJsonDataFromXml(modelVariantsUrl);

    const modelVariants: ModelVariant[] = jsonDataFromXml.getElementsByTagName('V-Modellvariante').map((variante) => {
      const currentAttributes = variante.attributes;
      return { id: currentAttributes.id, name: currentAttributes.name };
    });

    setModelVariantsData(modelVariants);
  }

  return (
    <>
      <Form.Item {...layout}>
        <Select
          placeholder={t('common.PleaseChoose')}
          onChange={(value: string) => {
            console.log('ATTENTION changing modelVariant', value);
            setTailoringParameter({ modelVariantId: value });
          }}
          value={tailoringParameter.modelVariantId}
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
      {tailoringParameter.modelVariantId && <ProjectTypeVariantComponent />}
    </>
  );
}
