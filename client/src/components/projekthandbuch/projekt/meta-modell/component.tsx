import { Form, Select } from 'antd';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { MetaModel } from '../../../../../openapi';
import { META_MODELS, MetaModellController } from './controller';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export class MetaModellComponent extends ReactComponent<unknown, MetaModellController> implements GenericComponent {
  public ctrl: MetaModellController = new MetaModellController();

  public render(): JSX.Element {
    return (
      <Form.Item {...layout}>
        <Select
          placeholder="Bitte wählen"
          onChange={(value: number) => {
            this.ctrl.projekthandbuchService.setMetaModelId(value);
          }}
        >
          {META_MODELS.map((metaModel: MetaModel, index: number) => {
            return (
              <Option value={metaModel.id} key={`meta-model-${index}`}>
                {metaModel.name}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
    );
  }
}
