import { Cascader, Form } from 'antd';
import { CascaderValueType } from 'antd/es/cascader';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { ProjekttypvarianteController } from './controller';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

export class ProjekttypvarianteComponent
  extends ReactComponent<unknown, ProjekttypvarianteController>
  implements GenericComponent
{
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
                options={this.ctrl.projectTypeVariants.filter((x) => x.children?.length > 0)}
                onChange={(value: CascaderValueType) => {
                  this.ctrl.changeProjectTypeVariant(value[1] as string);
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
