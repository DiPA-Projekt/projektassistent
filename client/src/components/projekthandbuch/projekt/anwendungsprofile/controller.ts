import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjectFeature } from '../../../../../openapi/models/ProjectFeature';
import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import PROJECT_FEATURES from './project.features.json';

export interface ExtendedProjectFeature extends ProjectFeature {
  values: {
    selectedValue: string;
    possibleValues: {
      key: string;
      title: string;
    }[];
  };
}

export class AnwendungsprofileController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public getProjectFeatures(projectTypeId: number, projectTypeVariantId: number): ExtendedProjectFeature[] {
    const projectFeatures =
      PROJECT_FEATURES.find(
        (item) => item.projectTypeId === projectTypeId && item.projectTypeVariantId === projectTypeVariantId
      )?.projectTypeFeatures || [];
    return projectFeatures as ExtendedProjectFeature[];
  }
}
