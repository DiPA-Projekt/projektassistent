import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry } from '../../../../../../openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { decodeXml } from '../../../../../shares/utils';

export class ProcessContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');
  public collapsed = false;

  public pageEntry: PageEntry | undefined;

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private decisionPointSubscription: Subscription = new Subscription();
  private disciplineSubscription: Subscription = new Subscription();
  private productSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();
  private navigationSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private decisionPointId = '';
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

    this.decisionPointSubscription = this.projekthandbuchService
      .getDecisionPointId()
      .subscribe((decisionPointId: string) => {
        if (decisionPointId !== '') {
          this.decisionPointId = decisionPointId;
        }
      });

    this.projectFeaturesSubscription = this.projekthandbuchService
      .getProjectFeatureValues()
      .subscribe((projectFeatures: []) => {
        this.projectFeatures = projectFeatures;
      });
  }

  public async getContent(): Promise<any> {
    const url =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Entscheidungspunkt/' +
      this.decisionPointId +
      '?' +
      this.getProjectFeaturesString();

    let idCounter = 2000;

    return axios.get(url).then((response) => {
      const jsonDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

      const sinnUndZweck: any = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

      const entscheidungspunktZuProduktRef: any = jsonDataFromXml.getElementsByTagName(
        'EntscheidungspunktZuProduktRef'
      );

      const tableEntries = [];

      const products = entscheidungspunktZuProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            menuEntryId: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (products.length > 0) {
        tableEntries.push({
          id: idCounter++,
          descriptionEntry: 'Zugeordnete Produkte',
          dataEntries: products,
        });
      }

      //////////////////////////////////////////////

      this.pageEntry = {
        id: jsonDataFromXml.attributes.id,
        menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };

      return this.pageEntry;

      //
      // TODO: check if needed
      // this.projekthandbuchService.setNavigationData(this.menuEntries);

      // this.onUpdate();
    });
    // .catch((e) => {
    //   console.log(e);
    //   // 'obligatory catch'
    // });
    // this.onUpdate();
  }

  public async getThemaContent(themaId: string): Promise<string | HTMLCollectionOf<Element>> {
    const urlThema =
      'https://vmxt-api.vom-dach.de/Tailoring/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttyp/' +
      this.projectTypeId +
      '/Projekttypvariante/' +
      this.projectTypeVariantId +
      '/Produkt/' +
      this.decisionPointId +
      '/Thema/' +
      themaId +
      '?' +
      this.getProjectFeaturesString();

    return axios.get(urlThema).then((response) => {
      const jsonThemaDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

      const description = jsonThemaDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
      return decodeXml(description);
    });
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.decisionPointSubscription.unsubscribe();
    this.disciplineSubscription.unsubscribe();
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

    return findId(menuEntryId, this.menuEntries);
  }

  // public setId(id: string): void {
  //   // console.log('id', id);
  // }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature) => {
        return feature.id + '=' + feature.values.selectedValue;
      })
      .join('&');
  }
}
