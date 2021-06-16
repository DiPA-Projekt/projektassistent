import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../services/projekthandbuch/service';
import PROJECT_FEATURES from './project.features.json';

// Tiny helper interface
interface ContainsProductFeatures {
  projectFeatures: ProjectFeature[];
  projectTypeId: number;
  projectTypeVariantId: number;
}

export class ProjektController extends AbstractController {
  public readonly projectFeatures: ContainsProductFeatures[] = PROJECT_FEATURES as ContainsProductFeatures[];
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public getProjectFeatures(projectTypeVariantId: number): ProjectFeature[] {
    return (
      this.projectFeatures.find((item) => item.projectTypeVariantId === projectTypeVariantId)?.projectFeatures || []
    );
  }
}
