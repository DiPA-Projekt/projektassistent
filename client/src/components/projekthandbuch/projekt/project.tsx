import React from 'react';
// import {useSearchParams} from "react-router-dom";
import { Form } from 'antd';
import { ProjektkennzahlenComponent } from './projektkennzahlen/component';
import { ModelVariantComponent } from './modelVariant';

export type ProjectFeatureStringOption = {
  key: string;
  title: string;
  answer: string;
};

export type ProjectFeature = {
  id: string;
  name: string;
  description?: string;
  helpText?: string;
  values: { selectedValue: string; possibleValues: ProjectFeatureStringOption[] };
};

export type ProjectType = {
  id: string;
  name: string;
};

export type ProjectTypeVariant = {
  id: string;
  name: string;
};

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
