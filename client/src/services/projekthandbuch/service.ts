import { BehaviorSubject, Observable } from 'rxjs';
import { MenuEntry, ModelVariant, ProjectFeature } from '@dipa-projekt/projektassistent-openapi';

interface NavigationMenuEntry {
  title: string;
  entries: MenuEntry[];
}

export class ProjekthandbuchService {
  public metaModelId = new BehaviorSubject<string>('');
  public modelVariantsData = new BehaviorSubject<ModelVariant[]>([]);
  public modelVariantsId = new BehaviorSubject<string>('');
  public projectTypeVariantsData = new BehaviorSubject<any[]>([]);
  public projectTypeVariantId = new BehaviorSubject<string>('');
  public projectTypeId = new BehaviorSubject<string>('');
  public disciplineId = new BehaviorSubject<string>('');
  public productId = new BehaviorSubject<string>('');

  public roleId = new BehaviorSubject<string>('');
  public decisionPointId = new BehaviorSubject<string>('');
  public processBuildingBlockId = new BehaviorSubject<string>('');

  public projectFeaturesDataFromProjectType = new BehaviorSubject<ProjectFeature[]>([]);
  public projectFeaturesDataFromProjectTypeVariant = new BehaviorSubject<ProjectFeature[]>([]);

  public projectFeatureValues = new BehaviorSubject<ProjectFeature[]>([]);

  public navigationData = new BehaviorSubject<NavigationMenuEntry[]>([]);

  public getMetaModelId(): Observable<string> {
    return this.metaModelId;
  }

  public setMetaModelId(value: string): void {
    this.metaModelId.next(value);
  }

  public getModelVariantsData(): Observable<ModelVariant[]> {
    return this.modelVariantsData;
  }

  public setModelVariantsData(value: ModelVariant[]): void {
    this.modelVariantsData.next(value);
  }

  public getModelVariantId(): Observable<string> {
    return this.modelVariantsId;
  }

  public setModelVariantId(value: string): void {
    this.modelVariantsId.next(value);
  }

  public getProjectTypeVariantData(): Observable<any> {
    return this.projectTypeVariantsData;
  }

  public setProjectTypeVariantsData(value: any[]): void {
    this.projectTypeVariantsData.next(value);
  }

  public getProjectTypeVariantId(): Observable<string> {
    return this.projectTypeVariantId;
  }

  public setProjectTypeVariantId(value: string): void {
    this.projectTypeVariantId.next(value);
  }

  public getProjectTypeId(): Observable<string> {
    return this.projectTypeId;
  }

  public setProjectTypeId(value: string): void {
    this.projectTypeId.next(value);
  }

  public getDisciplineId(): Observable<string> {
    return this.disciplineId;
  }

  public setDisciplineId(value: string): void {
    this.disciplineId.next(value);
  }

  public getProductId(): Observable<string> {
    return this.productId;
  }

  public setProductId(value: string): void {
    this.productId.next(value);
  }

  public getRoleId(): Observable<string> {
    return this.roleId;
  }

  public setRoleId(value: string): void {
    this.roleId.next(value);
  }

  public getDecisionPointId(): Observable<string> {
    return this.decisionPointId;
  }

  public setDecisionPointId(value: string): void {
    this.decisionPointId.next(value);
  }

  public getProcessBuildingBlockId(): Observable<string> {
    return this.processBuildingBlockId;
  }

  public setProcessBuildingBlockId(value: string): void {
    this.processBuildingBlockId.next(value);
  }

  public getProjectFeaturesDataFromProjectType(): Observable<ProjectFeature[]> {
    return this.projectFeaturesDataFromProjectType;
  }

  public setProjectFeaturesDataFromProjectType(value: ProjectFeature[]): void {
    this.projectFeaturesDataFromProjectType.next(value);
  }

  public getProjectFeaturesDataFromProjectTypeVariant(): Observable<ProjectFeature[]> {
    return this.projectFeaturesDataFromProjectTypeVariant;
  }

  public setProjectFeaturesDataFromProjectTypeVariant(value: ProjectFeature[]): void {
    this.projectFeaturesDataFromProjectTypeVariant.next(value);
  }

  public getProjectFeatureValues(): Observable<ProjectFeature[]> {
    return this.projectFeatureValues;
  }

  public setProjectFeatureValues(value: ProjectFeature[]): void {
    this.projectFeatureValues.next(value);
  }

  public getNavigationData(): Observable<NavigationMenuEntry[]> {
    return this.navigationData;
  }

  public setNavigationData(value: any[]): void {
    this.navigationData.next(value);
  }
}
