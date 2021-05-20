import { DI } from '@leanup/lib/helpers/injector';

import { StatusApi } from '../../openapi';
import { ProjekthandbuchService } from '../services/projekthandbuch/service';
import { ProduktvorlagenService } from '../services/projekthandbuch/produktvorlagen/service';

const service = new ProjekthandbuchService();
const produktVorlagenService = new ProduktvorlagenService();

DI.register('Projekthandbuch', service);
DI.register('Produktvorlagen', produktVorlagenService);
DI.register('StatusApi', new StatusApi());
