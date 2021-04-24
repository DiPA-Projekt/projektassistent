import { Form, Select } from 'antd';
import React from 'react';

import { ModelVariant } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { MODEL_VARIANTS, ModellVarianteController } from './controller';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export class ModellVarianteComponent
  extends ReactComponent<unknown, ModellVarianteController>
  implements GenericComponent {
  public ctrl: ModellVarianteController = new ModellVarianteController();

  public render(): JSX.Element {
    return (
      <Form.Item {...layout}>
        <Select
          placeholder="Bitte wählen"
          onChange={(value: number) => {
            this.ctrl.projekthandbuchService.setMetaModelId(value);
          }}
        >
          {MODEL_VARIANTS.map((modelVariant: ModelVariant, index: number) => {
            return (
              <Option value={modelVariant.id} key={`meta-model-${index}`}>
                {modelVariant.name}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
    );
  }
}
