import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectManualService {
  private metaModelId = new BehaviorSubject(-1);
  private projectTypeId = new BehaviorSubject(-1);
  private projectTypeVariantId = new BehaviorSubject(-1);

  getMetaModelId(): Observable<number> {
    return this.metaModelId;
  }

  setMetaModelId(value: number): void {
    this.metaModelId.next(value);
  }

  getProjectTypeId(): Observable<number> {
    return this.projectTypeId;
  }

  setProjectTypeId(value: number): void {
    this.projectTypeId.next(value);
  }

  getProjectTypeVariantId(): Observable<number> {
    return this.projectTypeVariantId;
  }

  setProjectTypeVariantId(value: number): void {
    this.projectTypeVariantId.next(value);
  }
}
