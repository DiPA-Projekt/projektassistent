import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectManualService {
  private projectTypeId = new BehaviorSubject(-1);
  private projectTypeVariantId = new BehaviorSubject(-1);

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
