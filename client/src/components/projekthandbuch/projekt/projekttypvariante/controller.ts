import { Subscription } from 'rxjs';

import { ProjectTypeVariant } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';

export const PROJECT_TYPE_VARIANTS: {
  projectTypeId: number;
  projectTypeVariant: ProjectTypeVariant[];
}[] = [
  {
    projectTypeId: -1,
    projectTypeVariant: [],
  },
  {
    projectTypeId: 1,
    projectTypeVariant: [
      { id: 1, name: 'AG-Projekt mit einem Auftragnehmer' },
      { id: 2, name: 'AG-Projekt mit mehreren Auftragnehmern' },
    ],
  },
  {
    projectTypeId: 2,
    projectTypeVariant: [
      { id: 3, name: 'AN-Projekt mit Entwicklung, Weiterentwicklung oder Migration' },
      { id: 4, name: 'AN-Projekt mit Wartung und Pflege' },
    ],
  },
  {
    projectTypeId: 3,
    projectTypeVariant: [
      { id: 5, name: 'AG-AN-Projekt mit Entwicklung, Weiterentwicklung oder Migration' },
      { id: 6, name: 'AG-AN-Projekt mit Wartung und Pflege' },
    ],
  },
];

export class ProjekttypvarianteController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private projectTypeSubscription: Subscription = new Subscription();

  public projectTypeVariants: ProjectTypeVariant[] = [];

  public onInit(): void {
    this.projectTypeSubscription = this.projekthandbuchService.getProjectTypeId().subscribe((projectTypeId) => {
      this.projectTypeVariants = this.getProjectTypeVariants(projectTypeId);
      console.log(`this.getProjectTypeVariants(${projectTypeId})`, this.getProjectTypeVariants(projectTypeId));
      this.onUpdate();
    });
  }

  public onDestroy(): void {
    this.projectTypeSubscription.unsubscribe();
  }

  public setProjectTypeVariantId(value: number): void {
    this.projekthandbuchService.setProjectTypeVariantId(value);
  }

  public getProjectTypeVariants(projectTypeId: number): ProjectTypeVariant[] {
    return PROJECT_TYPE_VARIANTS.find((item) => item.projectTypeId === projectTypeId)?.projectTypeVariant || [];
  }

  public changeProjectTypeVariant(projectTypeVariantId: number): void {
    this.projekthandbuchService.setProjectTypeVariantId(projectTypeVariantId);
  }
}
