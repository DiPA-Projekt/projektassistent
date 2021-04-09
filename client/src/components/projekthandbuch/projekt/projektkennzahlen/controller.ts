import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import { Subscription } from 'rxjs';

export class ProjektkennzahlenController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private projectTypeVariantSubscription: Subscription = new Subscription();

  public showProjektkennzahlen = false;

  public onInit(): void {
    this.projectTypeVariantSubscription = this.projekthandbuchService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId: number) => {
        this.showProjektkennzahlen = projectTypeVariantId > -1;
        this.onUpdate();
      });
  }

  public onDestroy(): void {
    this.projectTypeVariantSubscription.unsubscribe();
  }
}
