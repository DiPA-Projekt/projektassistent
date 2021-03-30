import Form from 'antd/lib/form/Form';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { AnwendungsprofileComponent } from './anwendungsprofile/component';
import { ProjektController } from './controller';
import { ModellVarianteComponent } from './modellvariante/component';
import { ProjekttypvarianteComponent } from './projekttypvariante/component';
import { ProjektkennzahlenComponent } from './projektkennzahlen/component';

export class ProjektComponent extends ReactComponent<unknown, ProjektController> implements GenericComponent {
  public ctrl: ProjektController = new ProjektController();

  public render(): JSX.Element {
    return (
      <Form
        name="basic"
        layout="vertical"
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        initialValues={{}}
      >
        <h2>Wähle die Modellvariante</h2>
        <ModellVarianteComponent />
        <ProjekttypvarianteComponent />
        <AnwendungsprofileComponent />
        <ProjektkennzahlenComponent />
      </Form>
    );
  }
}
