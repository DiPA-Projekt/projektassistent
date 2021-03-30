import { StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../services/projekthandbuch/service';

const service = new ProjekthandbuchService();
console.log(service);

DI.register('Projekthandbuch', service);
DI.register('StatusApi', new StatusApi());
