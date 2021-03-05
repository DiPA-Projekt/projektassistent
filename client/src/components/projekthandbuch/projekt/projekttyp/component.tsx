import { Form, Select } from 'antd';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProjectType } from '../../../../../openapi/models/ProjectType';
import { ProjekttypvarianteComponent } from '../projekttypvariante/component';
import { ProjekttypController } from './controller';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export class ProjekttypComponent extends ReactComponent<unknown, ProjekttypController> implements GenericComponent {
  public readonly ctrl: ProjekttypController;

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new ProjekttypController(this.forceUpdate.bind(this));
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
        {this.ctrl.projectTypes.length > 0 && (
          <>
            <h1>Projekttyp</h1>
            <Form.Item {...layout} label="Projekttyp">
              <Select
                onChange={(value: number) => {
                  this.ctrl.projekthandbuchService.setProjectTypeId(value);
                }}
                // onFocus={onFocus}
                // onBlur={onBlur}
                // onSearch={onSearch}
                // filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.ctrl.projectTypes.map((projectType: ProjectType, index: number) => {
                  return (
                    <Option value={projectType.id} key={`project-type-${index}`}>
                      {projectType.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <ProjekttypvarianteComponent />
          </>
        )}
      </>
    );
  }
}
