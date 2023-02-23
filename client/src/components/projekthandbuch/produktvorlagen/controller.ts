import { AbstractController, DI } from '@leanup/lib';

import TEMPLATE_DATA from './project.templates.json';
import { ProduktvorlagenService } from '../../../services/projekthandbuch/produktvorlagen/service';
import { Key } from 'react';

interface TemplateProps {
  id: number;
  type: string;
  checkable: boolean;
  checked: boolean;
  disabled: boolean;
  displayName: string;
  infoText: string;
  selected: boolean;
  selectable: boolean;
  url: string;
  files: TemplateProps[];
  subMenuEntries: TemplateProps[];
}

export class ProduktvorlagenController extends AbstractController {
  public readonly projectTemplates = TEMPLATE_DATA as TemplateProps[];
  public readonly produktvorlagenService: ProduktvorlagenService = DI.get<ProduktvorlagenService>('Produktvorlagen');

  public showAll = false;
  public checkAllProductTemplates = false;
  public checkAllSamples = false;

  public getCheckedKeys(inputData: TemplateProps[]): Key[] {
    let result: Key[] = [];

    if (!this.checkAllProductTemplates) {
      return result;
    }

    for (const entry of inputData) {
      if (entry.type === 'submenu' && this.checkAllProductTemplates && entry.checked) {
        result.push(entry.id.toString());
      }
      if (entry.type === 'chapter') {
        result.push(entry.id.toString());
      }
      if (entry.type === 'sample' && this.checkAllSamples && entry.checked) {
        result.push(entry.id.toString());
      }

      if (entry.subMenuEntries?.length > 0) {
        result = result.concat(this.getCheckedKeys(entry.subMenuEntries));
      }
    }

    return result || [];
  }
}
