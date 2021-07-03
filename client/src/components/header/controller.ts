import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { STARTUP_TIMESTAMP } from '../../shares/constant';

export class HeaderController extends AbstractController {
  public readonly currentDate: Date = new Date(STARTUP_TIMESTAMP);
  public readonly application: { name: string; version: string } =
    DI.get<{ name: string; version: string }>('Application');
}
