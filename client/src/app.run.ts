import { DI } from '@leanup/lib';

import * as APPLICATION_JSON from '../package.json';
import { typeIt } from './shares/utils';

const TYPED_APPLICATION_JSON = typeIt<{ version: string }>(APPLICATION_JSON);

export const importCatch = (error: unknown): void => {
  console.warn(error);
};

export const run = (name: string, version: string | null, bootstrap: Function): void => {
  DI.register('Framework', {
    name,
    version,
  });
  DI.register('Application', {
    name: 'DiPA-Projektassistent',
    version: TYPED_APPLICATION_JSON.version,
  });
  import(
    /* webpackMode: "eager" */
    /* webpackChunkName: "shares.register" */
    './shares/register'
  )
    .then(() => {
      bootstrap();
    })
    .catch(importCatch);
};
