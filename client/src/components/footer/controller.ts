import { AbstractController } from '@leanup/lib';
import { DI } from '@leanup/lib';

import { STARTUP_TIMESTAMP } from '../../shares/constant';

export class FooterController extends AbstractController {
  public readonly currentDate: Date = new Date(STARTUP_TIMESTAMP);
  public readonly application: { name: string; version: string } = DI.get<{ name: string; version: string }>(
    'Application'
  );
}
