import { AbstractController } from '@leanup/lib/components/generic';

import { PageEntry, TableEntry, ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';
import axios from 'axios';
//xml file reader
import XMLParser from 'react-xml-parser';
import { ProjekthandbuchService } from '../../../../../services/projekthandbuch/service';
import { DI } from '@leanup/lib/helpers/injector';
import { decodeXml } from '../../../../../shares/utils';

export class ProcessContentController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectTypeSubscription: Subscription = new Subscription();
  private projectTypeVariantSubscription: Subscription = new Subscription();
  private decisionPointSubscription: Subscription = new Subscription();
  private disciplineSubscription: Subscription = new Subscription();
  private productSubscription: Subscription = new Subscription();
  private projectFeaturesSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeId = '';
  private projectTypeVariantId = '';
  private decisionPointId = '';
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

    this.decisionPointSubscription = this.projekthandbuchService
      .getDecisionPointId()
      .subscribe((decisionPointId: string) => {
        if (decisionPointId !== '') {
          this.decisionPointId = decisionPointId;
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
      console.log(response.data);
      const jsonDataFromXml = new XMLParser().parseFromString(response.data);

      const sinnUndZweck = decodeXml(jsonDataFromXml.getElementsByTagName('Sinn_und_Zweck')[0]?.value);

      const entscheidungspunktZuProduktRef = jsonDataFromXml.getElementsByTagName('EntscheidungspunktZuProduktRef');

      const tableEntries: TableEntry[] = [];

      const products = entscheidungspunktZuProduktRef.flatMap((entry) => {
        return entry.getElementsByTagName('ProduktRef').map((productRef) => {
          return {
            id: productRef.attributes.id,
            title: productRef.attributes.name,
          };
        });
      });

      if (products.length > 0) {
        tableEntries.push({
          id: (idCounter++).toString(),
          descriptionEntry: 'Zugeordnete Produkte',
          dataEntries: products,
        });
      }

      //////////////////////////////////////////////

      return {
        id: jsonDataFromXml.attributes.id,
        // menuEntryId: jsonDataFromXml.attributes.id,
        header: jsonDataFromXml.attributes.name,
        descriptionText: sinnUndZweck,
        tableEntries: tableEntries,
        // subPageEntries: subPageEntries,
      };

      // this.onUpdate();
    });
    // .catch((e) => {
    //   console.log(e);
    //   // 'obligatory catch'
    // });
    // this.onUpdate();
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectTypeSubscription.unsubscribe();
    this.projectTypeVariantSubscription.unsubscribe();
    this.decisionPointSubscription.unsubscribe();
    this.disciplineSubscription.unsubscribe();
    this.productSubscription.unsubscribe();
    this.projectFeaturesSubscription.unsubscribe();
  }

  private getProjectFeaturesString(): string {
    return this.projectFeatures
      .map((feature: ProjectFeature) => {
        return `${feature.id}=${feature.values?.selectedValue}`;
      })
      .join('&');
  }
}
