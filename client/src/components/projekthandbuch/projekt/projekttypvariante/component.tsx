import { Cascader, Form } from 'antd';
import { CascaderValueType } from 'antd/es/cascader';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { PROJECT_TYPE_VARIANTS, ProjekttypvarianteController } from './controller';

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
          <>
            <h2>Wähle die Projekttypvariante</h2>
            <Form.Item {...layout}>
              <Cascader
                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                options={PROJECT_TYPE_VARIANTS}
                onChange={(value: CascaderValueType) => {
                  this.ctrl.setProjectTypeVariantId(value[1] as number);
                }}
                placeholder="Bitte wählen"
              />
            </Form.Item>
          </>
        )}
      </>
    );
  }
}
