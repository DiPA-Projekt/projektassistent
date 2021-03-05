import { Form, Select } from 'antd';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { AnwendungsprofileController, ExtendedProjectFeature } from './controller';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export class AnwendungsprofileComponent
  extends ReactComponent<unknown, AnwendungsprofileController>
  implements GenericComponent {
  public ctrl: AnwendungsprofileController;

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new AnwendungsprofileController(this.forceUpdate.bind(this));
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
        {this.ctrl.projectFeatures.length > 0 && (
          <>
            <h1>Anwendungsprofil</h1>
            {this.ctrl.projectFeatures.map((projectFeature: ExtendedProjectFeature) => {
              return (
                <Form.Item
                  {...layout}
                  key={`${projectFeature.name}-${projectFeature.id}`}
                  name={projectFeature.id}
                  label={projectFeature.name}
                  initialValue={projectFeature.values.selectedValue}
                >
                  <Select
                    onChange={(value: number) => {
                      console.log(value);
                    }}
                    // onFocus={onFocus}
                    // onBlur={onBlur}
                    // onSearch={onSearch}
                    // filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {projectFeature.values.possibleValues.map((value: { key: string; title: string }) => {
                      return (
                        // wir müssen als Key in der API einen anderen Datentype wählen / oder mappen
                        <Option key={`${projectFeature.name}-${projectFeature.id}-${value.key}`} value={value.key}>
                          {value.title}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              );
            })}
          </>
        )}
      </>
    );
  }
}
