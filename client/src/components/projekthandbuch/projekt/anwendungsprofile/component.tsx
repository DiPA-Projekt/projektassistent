import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { AnwendungsprofileController, ExtendedProjectFeature } from './controller';
import { SelectComponent } from '../select/component';

export class AnwendungsprofileComponent
  extends ReactComponent<unknown, AnwendungsprofileController>
  implements GenericComponent
{
  public ctrl: AnwendungsprofileController;

  public constructor(props: unknown) {
    super(props);
    this.ctrl = new AnwendungsprofileController(this.forceUpdate.bind(this));
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
        {this.ctrl.projectFeatures.length > 0 && (
          <>
            <h2>Definiere das Anwendungsprofil</h2>
            {this.ctrl.projectFeatures.map((projectFeature: ExtendedProjectFeature) => {
              return (
                <SelectComponent key={`${projectFeature.name}-${projectFeature.id}`} projectFeature={projectFeature} />
              );
            })}
          </>
        )}
      </>
    );
  }
}
