import { ModelVariant } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';
import { DI } from '@leanup/lib/helpers/injector';

import { ProjekthandbuchService } from '../../../../services/projekthandbuch/service';
import axios from 'axios';

//xml file reader
import XMLParser from 'react-xml-parser';

export class ModellVarianteController extends AbstractController {
  public readonly projekthandbuchService: ProjekthandbuchService = DI.get<ProjekthandbuchService>('Projekthandbuch');

  public modelVariants: ModelVariant[] = [];

  public state = {
    ModelVariantsId: '',
    ModelVariantsData: [],
  };

  // public changeMetaModel(mataModelId: string): void {
  //   this.projekthandbuchService.setMetaModelId(mataModelId);
  //   this.projekthandbuchService.setProjectTypeVariantId(-1);
  // }

  public changeModelVariant(modelVariantId: string): void {
    // this.projekthandbuchService.setMetaModelId(mataModelId);
    this.projekthandbuchService.setModelVariantId(modelVariantId);
    this.projekthandbuchService.setProjectTypeVariantId('');
  }

  public fetchData(): any {
    axios
      .get('https://vmxt-api.vom-dach.de/V-Modellmetamodell/mm_2021/V-Modellvariante')
      .then((response) => {
        const jsonDataFromXml = new XMLParser().parseFromString(response.data, 'application/xml') as Document;

        const modelVariants: ModelVariant[] = jsonDataFromXml
          .getElementsByTagName('V-Modellvariante')
          .map((variante) => {
            return variante.attributes as ModelVariant;
          });

        this.modelVariants = modelVariants;

        // wichtig
        this.projekthandbuchService.setModelVariantsData(modelVariants);
      })
      .catch(() => 'obligatory catch');
  }
}
