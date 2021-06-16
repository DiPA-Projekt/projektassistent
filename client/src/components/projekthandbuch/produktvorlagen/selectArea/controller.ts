import { AbstractController } from '@leanup/lib/components/generic';

import { DI } from '@leanup/lib/helpers/injector';
import { ProduktvorlagenService } from '../../../../services/projekthandbuch/produktvorlagen/service';
import { Subscription } from 'rxjs';

export class SelectAreaController extends AbstractController {
  public readonly produktvorlagenService: ProduktvorlagenService = DI.get<ProduktvorlagenService>('Produktvorlagen');

  public showAll = false;
  public checkAllProductTemplates = true;
  public checkAllSamples = true;

  private checkAllProductTemplatesSubscription: Subscription = new Subscription();
  private checkAllSamplesSubscription: Subscription = new Subscription();

  public onInit(): void {
    this.checkAllProductTemplatesSubscription = this.produktvorlagenService
      .getCheckAllProductTemplates()
      .subscribe((checkAllProductTemplates: boolean) => {
        this.checkAllProductTemplates = checkAllProductTemplates;
        // console.log('bla: ', checkAllProductTemplates);
        this.onUpdate();
      });

    this.checkAllSamplesSubscription = this.produktvorlagenService
      .getCheckAllSamples()
      .subscribe((checkAllSamples: boolean) => {
        this.checkAllSamples = checkAllSamples;
        this.onUpdate();
      });

    this.checkAllSamplesSubscription = this.produktvorlagenService.getShowAll().subscribe((showAll: boolean) => {
      this.showAll = showAll;
      this.onUpdate();
    });
  }

  public onDestroy(): void {
    this.checkAllProductTemplatesSubscription.unsubscribe();
    this.checkAllSamplesSubscription.unsubscribe();
  }
}
