import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { MetaModel } from '../../../../../openapi';
import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';

export const META_MODELS: MetaModel[] = [
  { id: 1, name: 'VMXT' },
  { id: 2, name: 'VMXT Bund' },
  { id: 3, name: 'VMXT ITZ Bund' },
];

export class MetaModellController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public changeMetaModel(mataModelId: number): void {
    this.projekthandbuchService.setMetaModelId(mataModelId);
    this.projekthandbuchService.setProjectTypeVariantId(-1);
  }
}
