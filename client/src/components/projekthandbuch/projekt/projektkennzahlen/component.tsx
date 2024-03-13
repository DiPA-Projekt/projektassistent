import React, { Component } from 'react';

// import { GenericComponent } from '@leanup/lib';
// import { ReactComponent } from '@leanup/lib';

import { ProjektkennzahlenController } from './controller';

export class ProjektkennzahlenComponent extends Component<unknown, ProjektkennzahlenController> {
  // public readonly ctrl: ProjektkennzahlenController;

  public constructor(props: unknown) {
    super(props);
    // this.ctrl = new ProjektkennzahlenController(this.forceUpdate.bind(this));
  }

  public componentDidMount(): void {
    // this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    // this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    return (
      <>
        {/*{this.ctrl.showProjektkennzahlen && (*/}
        {/*  <>*/}
        {/*    <h2>Es ergeben sich folgende Projektkennzahlen</h2>*/}
        {/*    <p>Das Projekt Tailoring ergibt 15 zu erstellende Produkte und 8 zu besetzende Rollen</p>*/}
        {/*  </>*/}
        {/*)}*/}
      </>
    );
  }
}
