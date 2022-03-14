import { Subscription } from 'rxjs';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import axios from 'axios';
//xml file reader
import XMLParser, { XMLElement } from 'react-xml-parser';
import { decodeXml, removeHtmlTags } from '../../../../shares/utils';

export class AnwendungsprofileController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private metaModelVariantSubscription: Subscription = new Subscription();
  private projectFeaturesFromProjectTypeSubscription: Subscription = new Subscription();
  private projectFeaturesFromProjectTypeVariantSubscription: Subscription = new Subscription();
  private modelVariantsId = '-1';

  public projectFeatures: ProjectFeature[] = [];

  public onInit(): void {
    this.metaModelVariantSubscription = this.projekthandbuchService
      .getModelVariantId()
      .subscribe((modelVariantsId: string) => {
        this.modelVariantsId = modelVariantsId;
      });

    // TODO: projectFeaturesFromProjectTypeVariantSubscription
    this.projectFeaturesFromProjectTypeSubscription = this.projekthandbuchService
      .getProjectFeaturesDataFromProjectType()
      .subscribe((projectFeatures: ProjectFeature[]) => {
        // Für jedes Projektmerkmal hole die Details
        this.getProjectFeatureDetails(projectFeatures);
      });

    this.projectFeaturesFromProjectTypeVariantSubscription = this.projekthandbuchService
      .getProjectFeaturesDataFromProjectTypeVariant()
      .subscribe((projectFeatures: ProjectFeature[]) => {
        // Für jedes Projektmerkmal hole die Details
        this.getProjectFeatureDetails(projectFeatures);
      });
  }

  private async getOptionWithAnswer(values: XMLElement[], feature: ProjectFeature) {
    const promises: Promise<{ key: string; title: string; answer: string }>[] = [];

    values.forEach((value) => {
      const valueUrl =
        'https://vmxt-api.vom-dach.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        this.modelVariantsId +
        '/Projektmerkmal/' +
        feature.id +
        '/Wert/' +
        value.attributes.id;

      promises.push(
        axios.get(valueUrl).then((valueResponse) => {
          const valueJsonDataFromXml = new XMLParser().parseFromString(valueResponse.data);
          const valueDescription = valueJsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;

          return {
            key: value.attributes.id,
            title: value.attributes.name,
            answer: `<div style="float: left; margin-right: 5px;">ᐅ ${value.attributes.name}: </div>${valueDescription}`,
          };
        })
      );
    });

    return await Promise.all(promises).then((values) => {
      values.unshift({
        key: 'null',
        title: '--',
        answer: '',
      });

      return values;
    });
  }

  private getProjectFeatureDetails(projectFeatures: ProjectFeature[]): void {
    projectFeatures.forEach((feature) => {
      const projectFeatureUrl =
        'https://vmxt-api.vom-dach.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
        this.modelVariantsId +
        '/Projektmerkmal/' +
        feature.id;

      axios
        .get(projectFeatureUrl)
        .then((response) => {
          // console.log(response.data);
          const jsonDataFromXml = new XMLParser().parseFromString(response.data);

          const question = jsonDataFromXml.getElementsByTagName('Frage')[0]?.value;
          const description = jsonDataFromXml.getElementsByTagName('Beschreibung')[0]?.value;
          const defaultValue = jsonDataFromXml.getElementsByTagName('StandardwertRef')[0]?.attributes.id;

          void this.getOptionWithAnswer(jsonDataFromXml.getElementsByTagName('Wert'), feature).then((values) => {
            const projectFeature: ProjectFeature = {
              id: jsonDataFromXml.attributes.id,
              values: {
                selectedValue: defaultValue,
                possibleValues: values,
              },
              name: jsonDataFromXml.attributes.name,
              description: removeHtmlTags(decodeXml(question)),
              helpText: removeHtmlTags(decodeXml(description)),
            };

            // TODO: weitermachen
            this.projectFeatures.push(projectFeature);

            this.projekthandbuchService.setProjectFeatureValues(this.projectFeatures);
          });
        })
        .catch(() => 'obligatory catch');

      this.onUpdate();
    });
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
    this.projectFeaturesFromProjectTypeSubscription.unsubscribe();
    this.projectFeaturesFromProjectTypeVariantSubscription.unsubscribe();
  }

  // public getProjectFeatures(projectTypeVariantId: number): ExtendedProjectFeature[] {
  //   const projectFeatures =
  //     PROJECT_FEATURES.find((item) => item.projectTypeVariantId === projectTypeVariantId)?.projectTypeFeatures || [];
  //   return projectFeatures as ExtendedProjectFeature[];
  // }
}
