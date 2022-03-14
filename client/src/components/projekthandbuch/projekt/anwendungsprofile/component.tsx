import React from 'react';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { AnwendungsprofileController } from './controller';
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
            {this.ctrl.projectFeatures.map((projectFeature: ProjectFeature) => {
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
