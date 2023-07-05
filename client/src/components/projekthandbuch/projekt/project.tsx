import React from 'react';
// import {useSearchParams} from "react-router-dom";
import { Form } from 'antd';
import { ProjektkennzahlenComponent } from './projektkennzahlen/component';
import { ModelVariantComponent } from './modelVariant';

export function Project() {
  return (
    <Form
      name="basic"
      layout="vertical"
      // onFinish={onFinish}
      // onFinishFailed={onFinishFailed}
      initialValues={{}}
    >
      <h2>Wähle die Modellvariante</h2>
      <ModelVariantComponent />
      <ProjektkennzahlenComponent />
    </Form>
  );
}
