// import { StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../services/projekthandbuch/service';
import { ProduktvorlagenService } from '../services/projekthandbuch/produktvorlagen/service';
import { StatusApi } from '../../openapi';

const service = new ProjekthandbuchService();
const produktVorlagenService = new ProduktvorlagenService();

DI.register('Projekthandbuch', service);
DI.register('Produktvorlagen', produktVorlagenService);
DI.register('StatusApi', new StatusApi());
