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

      style={{ maxWidth: '800px', textAlign: 'center', margin: 'auto' }}
      initialValues={{}}
    >
      <ModelVariantComponent />
      <ProjektkennzahlenComponent />
    </Form>
  );
}
