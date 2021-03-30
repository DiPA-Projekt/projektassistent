import { Subscription } from 'rxjs';

import { ProjectType } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';

export const PROJECT_TYPES: {
  metaModelId: number;
  projectType: ProjectType[];
}[] = [
  {
    metaModelId: 1,
    projectType: [
      { id: 1, name: 'Systementwicklungsprojekt (AG)' },
      { id: 2, name: 'Systementwicklungsprojekt (AN)' },
      { id: 3, name: 'Systementwicklungsprojekt (AG/AN)' },
    ],
  },
  {
    metaModelId: 2,
    projectType: [
      { id: 1, name: 'Systementwicklungsprojekt (AG) Bund' },
      { id: 3, name: 'Systementwicklungsprojekt (AG/AN) Bund' },
    ],
  },
  {
    metaModelId: 3,
    projectType: [
      { id: 1, name: 'Systementwicklungsprojekt (AG) ITZ-Bund' },
      { id: 2, name: 'Systementwicklungsprojekt (AN) ITZ-Bund' },
    ],
  },
];

export class ProjekttypController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private metaModelSubscription: Subscription = new Subscription();

  public projectTypes: ProjectType[] = [];

  public onInit(): void {
    this.metaModelSubscription = this.projekthandbuchService.getMetaModelId().subscribe((metaModelId: number) => {
      this.projectTypes = this.getProjectTypes(metaModelId);
      console.log(`this.getProjectTypes(${metaModelId})`, this.getProjectTypes(metaModelId));
      this.onUpdate();
    });
  }

  public onDestroy(): void {
    this.metaModelSubscription.unsubscribe();
  }

  public setProjectTypeId(value: number): void {
    this.projekthandbuchService.setProjectTypeId(value);
  }

  public getProjectTypes(metaModelId: number): ProjectType[] {
    return PROJECT_TYPES.find((item) => item.metaModelId === metaModelId)?.projectType || [];
  }

  public changeProjectType(projectTypeId: number): void {
    this.projekthandbuchService.setProjectTypeId(projectTypeId);
    this.projekthandbuchService.setProjectTypeVariantId(-1);
  }
}
