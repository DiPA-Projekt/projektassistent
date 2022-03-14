import { Subscription } from 'rxjs';

import { ProjectFeature, ProjectType, ProjectTypeVariant } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import axios from 'axios';

//xml file reader
import XMLParser from 'react-xml-parser';

export class ProjekttypvarianteController extends AbstractController {
  private readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  private metaModelVariantSubscription: Subscription = new Subscription();

  private modelVariantsId = '';
  private projectTypeIdsMap = new Map(); //: { projectTypeVariantId: string; projectTypeId: string }[] = [];

  public projectTypeVariants: {
    id: number;
    name: string;
    children: ProjectTypeVariant[];
  }[] = [];

  public onInit(): void {
    // this.metaModelSubscription = this.projekthandbuchService.getMetaModelId().subscribe((metaModelId: number) => {

    this.metaModelVariantSubscription = this.projekthandbuchService
      .getModelVariantId()
      .subscribe((modelVariantsId: string) => {
        this.modelVariantsId = modelVariantsId;

        this.projectTypeIdsMap.clear();

        axios
          .get(
            'https://vmxt-api.vom-dach.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
              modelVariantsId +
              '/Projekttypvariante'
          )
          .then((response) => {
            const jsonDataFromXml = new XMLParser().parseFromString(response.data);
            const projectTypeVariants: ProjectTypeVariant[] = jsonDataFromXml
              .getElementsByTagName('Projekttypvariante')
              .map((variante) => {
                const currentAttributes = variante.attributes;
                return { id: currentAttributes.id, name: currentAttributes.name };
              });

            this.projectTypeVariants = [];

            projectTypeVariants.forEach((projectTypeVariant) => {
              // TODO: nicht bei ' ' trennen -> z.B. Internes Projekt
              const key = projectTypeVariant.name.substr(0, projectTypeVariant.name.indexOf(' '));
              const value = projectTypeVariant.name.substr(projectTypeVariant.name.indexOf(' ') + 1);

              let pos = this.projectTypeVariants.find((x) => x.name === key);

              if (pos == null) {
                this.projectTypeVariants.push({ id: this.projectTypeVariants.length, name: key, children: [] });
                // TODO: schöner machen
                pos = this.projectTypeVariants.find((x) => x.name === key);
              }
              pos.children.push({ id: projectTypeVariant.id, version: projectTypeVariant.version, name: value });
            });

            this.projekthandbuchService.setProjectTypeVariantsData(projectTypeVariants);
          })
          .catch(() => 'obligatory catch');

        this.onUpdate();
      });
  }

  public onDestroy(): void {
    this.metaModelVariantSubscription.unsubscribe();
  }

  public changeProjectTypeVariant(projectTypeVariantId: string): void {
    this.projekthandbuchService.setProjectTypeVariantId(projectTypeVariantId);

    const url =
      'https://vmxt-api.vom-dach.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
      this.modelVariantsId +
      '/Projekttypvariante/' +
      projectTypeVariantId;

    // get projectTypeId, projectFeaturesDataFromProjectType and projectFeaturesDataFromProjectTypeVariant
    axios
      .get(url)
      .then((response) => {
        const jsonDataFromXml = new XMLParser().parseFromString(response.data);

        const projectType: ProjectType = jsonDataFromXml.getElementsByTagName('ProjekttypRef')[0]
          ?.attributes as ProjectType;

        this.projekthandbuchService.setProjectTypeId(projectType.id);

        ////////////////////////////////////////////////////////////////

        const projectFeatures: ProjectFeature[] = jsonDataFromXml
          .getElementsByTagName('ProjektmerkmalRef')
          .map((feature) => {
            return feature.attributes as ProjectFeature;
          });

        this.projekthandbuchService.setProjectFeaturesDataFromProjectTypeVariant(projectFeatures);

        ////////////////////////////////////////////////////////////////

        this.setProjectFeaturesDataFromProjectType(projectType.id);
      })
      .catch(() => 'obligatory catch');
  }

  public setProjectFeaturesDataFromProjectType(projectTypeId: string): void {
    // get projectTypeId, projectFeaturesDataFromProjectType and projectFeaturesDataFromProjectTypeVariant
    axios
      .get(
        'https://vmxt-api.vom-dach.de/V-Modellmetamodell/mm_2021/V-Modellvariante/' +
          this.modelVariantsId +
          '/Projekttyp/' +
          projectTypeId
      )
      .then((response) => {
        const jsonDataFromXml = new XMLParser().parseFromString(response.data);

        const projectFeatures: ProjectFeature[] = jsonDataFromXml
          .getElementsByTagName('ProjektmerkmalRef')
          .map((feature) => {
            return feature.attributes as ProjectFeature;
          });

        this.projekthandbuchService.setProjectFeaturesDataFromProjectType(projectFeatures);
      })
      .catch(() => 'obligatory catch');
  }
}
