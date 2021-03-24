import { BehaviorSubject, Observable } from 'rxjs';

export class ProjekthandbuchService {
  public metaModelId = new BehaviorSubject(-1);
  public projectTypeVariantId = new BehaviorSubject(-1);

  public getMetaModelId(): Observable<number> {
    return this.metaModelId;
  }

  public setMetaModelId(value: number): void {
    this.metaModelId.next(value);
  }

  public getProjectTypeVariantId(): Observable<number> {
    return this.projectTypeVariantId;
  }

  public setProjectTypeVariantId(value: number): void {
    this.projectTypeVariantId.next(value);
  }
}
