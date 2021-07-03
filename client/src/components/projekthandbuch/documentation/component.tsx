import React from 'react';

import { GenericComponent } from '@leanup/lib/components/generic';
import { ReactComponent } from '@leanup/lib/components/react';

import { DocumentationController } from './controller';
import { NavigationComponent } from './navigation/component';
import { ContentComponent } from './content/component';
import { Layout } from 'antd';

export class DocumentationComponent
  extends ReactComponent<unknown, DocumentationController>
  implements GenericComponent
{
  public ctrl: DocumentationController = new DocumentationController();

  public render(): JSX.Element {
    return (
      <Layout>
        <NavigationComponent />
        <ContentComponent />
      </Layout>
    );
  }
}
