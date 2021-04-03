import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjectTypeVariant } from '../../../../../openapi';
import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import { Subscription } from 'rxjs';

export const PROJECT_TYPE_VARIANTS: {
  id: number;
  name: string;
  children: ProjectTypeVariant[];
}[] = [
  {
    id: 1,
    name: 'AG-Projekt',
    children: [
      { id: 1, name: 'mit einem Auftragnehmer' },
      { id: 2, name: 'mit mehreren Auftragnehmern' },
    ],
  },
  {
    id: 2,
    name: 'AN-Projekt',
    children: [
      { id: 3, name: 'mit Entwicklung, Weiterentwicklung oder Migration' },
      { id: 4, name: 'mit Wartung und Pflege' },
    ],
  },
  {
    id: 3,
    name: 'AG-AN-Projekt',
    children: [
      { id: 5, name: 'mit Entwicklung, Weiterentwicklung oder Migration' },
      { id: 6, name: 'mit Wartung und Pflege' },
    ],
  },
];

export class ProjekttypvarianteController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private metaModelSubscription: Subscription = new Subscription();

  public projectTypeVariants: ProjectTypeVariant[] = [];

  public onInit(): void {
    this.metaModelSubscription = this.projekthandbuchService.getMetaModelId().subscribe((metaModelId: number) => {
      this.projectTypeVariants = this.getProjectTypeVariants(metaModelId);
      this.onUpdate();
    });
  }

  public onDestroy(): void {
    this.metaModelSubscription.unsubscribe();
  }

  public setProjectTypeVariantId(projectTypeVariantId: number): void {
    this.projekthandbuchService.setProjectTypeVariantId(projectTypeVariantId);
  }

  // for now the type variants are shown if any meta model is selected
  public getProjectTypeVariants(metaModelId: number): ProjectTypeVariant[] {
    return PROJECT_TYPE_VARIANTS.find(() => metaModelId > 0)?.children || [];
  }

  public changeProjectTypeVariant(projectTypeVariantId: number): void {
    this.projekthandbuchService.setProjectTypeVariantId(projectTypeVariantId);
  }
}
