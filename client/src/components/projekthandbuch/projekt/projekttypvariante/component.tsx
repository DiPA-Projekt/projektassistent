import { Form, Select } from 'antd';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProjectTypeVariant } from '../../../../../openapi/models/ProjectTypeVariant';
import { ProjekttypvarianteController } from './controller';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export class ProjekttypvarianteComponent
  extends ReactComponent<unknown, ProjekttypvarianteController>
  implements GenericComponent {
  public readonly ctrl: ProjekttypvarianteController;

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new ProjekttypvarianteController(this.forceUpdate.bind(this));
  }

  public componentDidMount(): void {
    this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    return (
      <>
        {this.ctrl.projectTypeVariants.length > 0 && (
          <Form.Item {...layout} label="Projekttypvariante">
            <Select
              onChange={(value: number) => {
                this.ctrl.projekthandbuchService.setProjectTypeVariantId(value);
              }}
              // onFocus={onFocus}
              // onBlur={onBlur}
              // onSearch={onSearch}
              // filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {this.ctrl.projectTypeVariants.map((projectTypeVariant: ProjectTypeVariant, index: number) => {
                return (
                  <Option value={projectTypeVariant.id} key={`project-type-variant-${index}`}>
                    {projectTypeVariant.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        )}
      </>
    );
  }
}
