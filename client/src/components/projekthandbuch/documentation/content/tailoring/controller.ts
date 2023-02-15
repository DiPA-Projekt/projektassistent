import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry, TableEntry, ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { decodeXml, replaceUmlaute } from '../../../../../shares/utils';

export class TailoringContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public pageEntry: PageEntry | undefined;

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private productSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();
  private navigationSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private processBuildingBlockId = '';
  private projectFeatures: ProjectFeature[] = [];

  public onInit(): void {
    this.metaModelVariantSubscription = this.projekthandbuchService
      .getModelVariantId()
      .subscribe((modelVariantsId: string) => {
        this.modelVariantsId = modelVariantsId;
      });

    this.projectTypeSubscription = this.projekthandbuchService.getProjectTypeId().subscribe((projectTypeId: string) => {
      this.projectTypeId = projectTypeId;
    });

    this.projectTypeVariantSubscription = this.projekthandbuchService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId: string) => {
        this.projectTypeVariantId = projectTypeVariantId;
      });

    this.productSubscription = this.projekthandbuchService
      .getProcessBuildingBlockId()
      .subscribe((processBuildingBlockId: string) => {
        if (processBuildingBlockId !== '') {
          this.processBuildingBlockId = processBuildingBlockId;
        }
      });

    this.projectFeaturesSubscription = this.projekthandbuchService
      .getProjectFeatureValues()
      .subscribe((projectFeatures: ProjectFeature[]) => {
        this.projectFeatures = projectFeatures;
      });
  }

  public async getContent(): Promise<PageEntry> {
    const url =
      'https://vm-api.weit-verein.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Vorgehensbaustein/' +
      this.processBuildingBlockId +
      '?' +
      this.getProjectFeaturesString();

    // let idCounter = 2000;

    return axios.get(url).then((response) => {
      console.log(response.data);

      const jsonDataFromXml = new XMLParser().parseFromString(replaceUmlaute(response.data));

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

      const tableEntries: TableEntry[] = [];

      return {
        id: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };
    });
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
    this.projectFeaturesSubscription.unsubscribe();
    this.navigationSubscription.unsubscribe();
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature: ProjectFeature) => {
        return `${feature.id}=${feature.values?.selectedValue}`;
      })
      .join('&');
  }
}
