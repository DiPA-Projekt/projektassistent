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
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2>Tailoring</h2>
      <p>
        Das V-Modell XT ist ein deutsches Prozessmodell, das in der Software- und Systementwicklung verwendet wird. Es
        ist eine Weiterentwicklung des ursprünglichen V-Modells und unterstützt die Planung, Durchführung und Kontrolle
        von Projekten, bei denen Software oder komplexe Systeme entwickelt werden.
      </p>
      <p>
        Auf dieser Seite können Projektbeteiligte das V-Modell XT an die konkreten Bedürfnisse ihres Projekts anpassen.
        Am Ende dieses Vorgangs steht eine an den Bedarf angepasste Dokumentation sowie eine Reihe an spezifischen
        Vorlagen für die Verwendung im Projekt.
      </p>
      <Form
        name="basic"
        layout="vertical"
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}

        style={{ textAlign: 'center' }}
        initialValues={{}}
      >
        <ModelVariantComponent />
        <ProjektkennzahlenComponent />
      </Form>
    </div>
  );
}
