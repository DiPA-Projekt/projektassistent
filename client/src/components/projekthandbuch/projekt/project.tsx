import React from 'react';
// import {useSearchParams} from "react-router-dom";
import { Form } from 'antd';
import { ProjektkennzahlenComponent } from './projektkennzahlen/component';
import { ModelVariant } from './modelVariant';

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
      <ModelVariant />
      <ProjektkennzahlenComponent />
    </Form>
  );
}
