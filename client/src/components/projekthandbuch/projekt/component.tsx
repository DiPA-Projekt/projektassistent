import Form from 'antd/lib/form/Form';
import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { AnwendungsprofileComponent } from './anwendungsprofile/component';
import { ProjektController } from './controller';
import { MetaModellComponent } from './meta-modell/component';
import { ProjekttypComponent } from './projekttyp/component';

export class ProjektComponent extends ReactComponent<unknown, ProjektController> implements GenericComponent {
  public ctrl: ProjektController = new ProjektController();

  public render(): JSX.Element {
    return (
      <Form
        name="basic"
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
      >
        <h1>Verfügbare Varianten</h1>
        <MetaModellComponent />
        <ProjekttypComponent />
        <AnwendungsprofileComponent />
      </Form>
    );
  }
}
