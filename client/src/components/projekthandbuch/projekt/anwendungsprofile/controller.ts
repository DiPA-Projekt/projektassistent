import { Subscription } from 'rxjs';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import PROJECT_FEATURES from './project.features.json';

export interface ExtendedProjectFeature extends ProjectFeature {
  values: {
    selectedValue: string;
    possibleValues: {
      key: string;
      title: string;
      answer: string;
    }[];
  };
}

export class AnwendungsprofileController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private projectTypeVariantSubscription: Subscription = new Subscription();
  private projectTypeVariantId = -1;

  public projectFeatures: ExtendedProjectFeature[] = [];

  public onInit(): void {
    this.projectTypeVariantSubscription = this.projekthandbuchService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId: number) => {
        this.projectTypeVariantId = projectTypeVariantId;
        this.projectFeatures = this.getProjectFeatures(this.projectTypeVariantId);
        this.onUpdate();
      });
  }

  public onDestroy(): void {
    this.projectTypeVariantSubscription.unsubscribe();
  }

  public getProjectFeatures(projectTypeVariantId: number): ExtendedProjectFeature[] {
    const projectFeatures =
      PROJECT_FEATURES.find((item) => item.projectTypeVariantId === projectTypeVariantId)?.projectTypeFeatures || [];
    return projectFeatures as ExtendedProjectFeature[];
  }
}
