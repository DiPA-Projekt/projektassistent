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
    }[];
  };
}

export class AnwendungsprofileController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private projectTypeId = -1;
  private projectTypeVariantId = -1;

  public projectFeatures: ExtendedProjectFeature[] = [];

  public onInit(): void {
    this.projectTypeSubscription = this.projekthandbuchService.getProjectTypeId().subscribe((projectTypeId: number) => {
      this.projectTypeId = projectTypeId;
      this.projectFeatures = this.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId);
      console.log(
        `this.getProjectFeatures(${this.projectTypeId}, ${this.projectTypeVariantId})`,
        this.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId)
      );
      this.onUpdate();
    });
    this.projectTypeVariantSubscription = this.projekthandbuchService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId: number) => {
        this.projectTypeVariantId = projectTypeVariantId;
        this.projectFeatures = this.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId);
        console.log(
          `this.getProjectFeatures(${this.projectTypeId}, ${this.projectTypeVariantId})`,
          this.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId)
        );
        this.onUpdate();
      });
  }

  public onDestroy(): void {
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
  }

  public getProjectFeatures(projectTypeId: number, projectTypeVariantId: number): ExtendedProjectFeature[] {
    const projectFeatures =
      PROJECT_FEATURES.find(
        (item) => item.projectTypeId === projectTypeId && item.projectTypeVariantId === projectTypeVariantId
      )?.projectTypeFeatures || [];
    return projectFeatures as ExtendedProjectFeature[];
  }
}
