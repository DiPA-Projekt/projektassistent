import { BehaviorSubject, Observable } from 'rxjs';

export class ProduktvorlagenService {
  public showAll = new BehaviorSubject(false);
  public checkAllProductTemplates = new BehaviorSubject(true);
  public checkAllSamples = new BehaviorSubject(true);

  public getShowAll(): Observable<boolean> {
    return this.showAll;
  }

  public setShowAll(value: boolean): void {
    this.showAll.next(value);
  }

  public getCheckAllProductTemplates(): Observable<boolean> {
    return this.checkAllProductTemplates;
  }

  public setCheckAllProductTemplates(value: boolean): void {
    this.checkAllProductTemplates.next(value);
  }

  public getCheckAllSamples(): Observable<boolean> {
    return this.checkAllSamples;
  }

  public setCheckAllSamples(value: boolean): void {
    this.checkAllSamples.next(value);
  }
}
