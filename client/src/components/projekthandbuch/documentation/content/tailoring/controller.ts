import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry } from '../../../../../../openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { decodeXml } from '../../../../../shares/utils';

export class TailoringContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');
  public collapsed = false;

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
  private projectFeatures = [];

  private menuEntries = [];

  public onInit(): void {
    const paramId = this.pageEntry?.id || 1;

    this.pageEntry = this.getPageEntryContent(paramId);

    this.metaModelVariantSubscription = this.projekthandbuchService
      .getModelVariantId()
      .subscribe((modelVariantsId: string) => {
        this.modelVariantsId = modelVariantsId;
      });

    this.navigationSubscription = this.projekthandbuchService.getNavigationData().subscribe((menuEntries: []) => {
      this.menuEntries = menuEntries;
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
      .subscribe((projectFeatures: []) => {
        this.projectFeatures = projectFeatures;
      });

    // this.getForkJoin();
  }

  public getContent(): Promise<any> {
    const url =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
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
      // console.log(response.data);

      const jsonDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;
      // console.log('Daten Tailoring', jsonDataFromXml);
    });
  }

  public async getThemaContent(themaId: string): Promise<string | HTMLCollectionOf<Element>> {
    const urlThema =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Disziplin/' +
      this.disciplineId +
      '/Produkt/' +
      this.productId +
      '/Thema/' +
      themaId +
      '?' +
      this.getProjectFeaturesString();

    // console.log('urlThema', urlThema);

    return axios.get(urlThema).then((response) => {
      const jsonThemaDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

      const description = jsonThemaDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
      return decodeXml(description);
    });
  }

  // public getForkJoin() {
  //   forkJoin([this.projekthandbuchService.getDisciplineId(), this.projekthandbuchService.getProductId()]).pipe(
  //     map(([disciplineId, productId]) => {
  //       // this.loading = false;
  //
  //       console.log('forkJoin', disciplineId, productId);
  //     })
  //   );
  // }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
    this.projectFeaturesSubscription.unsubscribe();
    this.navigationSubscription.unsubscribe();
  }

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public getPageEntryContent2(): PageEntry {
    // console.log('getPageEntryContent2', this.pageEntry);
    return this.pageEntry;
  }

  public getPageEntryContent(menuEntryId: string): PageEntry {
    function findId(id, arr) {
      return arr.reduce((a, item) => {
        if (a) {
          return a;
        }
        if (item.id === id) {
          return item;
        }
        if (item.subMenuEntries) {
          return findId(id, item.subMenuEntries);
        }
      }, null);
    }

    // this.projectTypeSubscription = this.projekthandbuchService.getNavigationData().subscribe((menuEntries: []) => {
    // menuEntries = menuEntries;

    // });

    return findId(menuEntryId, this.menuEntries);

    // const { id } = useParams();
    // const pageEntry = PAGES_DATA.find((item) => item.menuEntryId === menuEntryId);
    // return pageEntry as PageEntry;
  }

  public setId(id: string): void {
    // console.log('id', id);
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature) => {
        return feature.id + '=' + feature.values.selectedValue;
      })
      .join('&');
  }
}
