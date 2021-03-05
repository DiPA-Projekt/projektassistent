import { Form, Select } from 'antd';
import React from 'react';
import { Subscription } from 'rxjs';

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
  public ctrl: AnwendungsprofileController = new AnwendungsprofileController();

  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private projectFeatures: ExtendedProjectFeature[] = [];
  private projectTypeId = -1;
  private projectTypeVariantId = -1;

  public componentDidMount(): void {
    this.projectTypeSubscription = this.ctrl.projekthandbuchService
      .getProjectTypeId()
      .subscribe((projectTypeId: number) => {
        this.projectTypeId = projectTypeId;
        this.projectFeatures = this.ctrl.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId);
        console.log(
          `this.ctrl.getProjectFeatures(${this.projectTypeId}, ${this.projectTypeVariantId})`,
          this.ctrl.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId)
        );
        this.forceUpdate();
      });
    this.projectTypeVariantSubscription = this.ctrl.projekthandbuchService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId: number) => {
        this.projectTypeVariantId = projectTypeVariantId;
        this.projectFeatures = this.ctrl.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId);
        console.log(
          `this.ctrl.getProjectFeatures(${this.projectTypeId}, ${this.projectTypeVariantId})`,
          this.ctrl.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId)
        );
        this.forceUpdate();
      });
  }

  public componentWillUnmount(): void {
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
  }

  public render(): JSX.Element {
    console.log(this.projectFeatures);
    return (
      <>
        {this.projectFeatures.length > 0 && (
          <>
            <h1>Anwendungsprofil</h1>
            {this.projectFeatures.map((projectFeature: ExtendedProjectFeature) => {
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
