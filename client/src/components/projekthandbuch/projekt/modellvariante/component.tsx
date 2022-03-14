import { Form, Select } from 'antd';
import React from 'react';

import { ModelVariant } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ModellVarianteController } from './controller';
import { Subscription } from 'rxjs';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

export class ModellVarianteComponent
  extends ReactComponent<unknown, ModellVarianteController>
  implements GenericComponent
{
  public constructor(props: unknown) {
    super(props);
  }

  public ctrl: ModellVarianteController = new ModellVarianteController();

  private modelVariantsSubscription: Subscription = new Subscription();

  public componentDidMount(): void {
    this.modelVariantsSubscription = this.ctrl.projekthandbuchService
      .getModelVariantsData()
      .subscribe((modelVariants: ModelVariant[]) => {
        this.ctrl.modelVariants = modelVariants;
        this.setState({ modelVariants: modelVariants });
      });

    this.ctrl.fetchData();
  }

  public componentWillUnmount(): void {
    this.modelVariantsSubscription?.unsubscribe();
  }

  public render(): JSX.Element {
    return (
      <Form.Item {...layout}>
        <Select
          placeholder="Bitte wählen"
          onChange={(value: string) => {
            this.ctrl.changeModelVariant(value);
          }}
        >
          {this.ctrl.modelVariants.map((modelVariant: ModelVariant, index: number) => {
            return (
              <Option value={modelVariant.id} key={`meta-model-${index}`}>
                {modelVariant.name}
              </Option>
            );
          })}

          {/*.map((modelVariant: ModelVariant, index: number) => {*/}
          {/*  return (*/}
          {/*    <Option value={modelVariant.id} key={`meta-model-${index}`}>*/}
          {/*      {modelVariant.name}*/}
          {/*    </Option>*/}
          {/*  );*/}
          {/*})}*/}
        </Select>
      </Form.Item>
    );
  }
}
