import { DI } from '@leanup/lib/helpers/injector';

import { StatusApi } from '../../openapi';
import { ProjekthandbuchService } from '../services/projekthandbuch/service';

const service = new ProjekthandbuchService();

DI.register('Projekthandbuch', service);
DI.register('StatusApi', new StatusApi());
