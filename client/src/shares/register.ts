import { StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { DI } from '@leanup/lib';

import { ProduktvorlagenService } from '../services/projekthandbuch/produktvorlagen/service';

const produktVorlagenService = new ProduktvorlagenService();

DI.register('Produktvorlagen', produktVorlagenService);
DI.register('StatusApi', new StatusApi());
