import { AbstractController } from '@leanup/lib/components/generic';

import TEMPLATE_DATA from './project.templates.json';

// Tiny helper interfaces till OpenApi is updated
interface ArticleProps {
  id: number;
  type: string;
  displayName: string;
  infoText: string;
}

interface ChapterProps {
  id: number;
  displayName: string;
  infoText: string;
  articles: ArticleProps[];
}

interface FileProps {
  id: number;
  displayName: string;
  type: string;
  url: string;
}

interface SubMenuEntryProps {
  id: number;
  displayName: string;
  infoText: string;
  selectable: boolean;
  chapters: ChapterProps[];
  files: FileProps[];
}

interface TemplateProps {
  id: number;
  displayName: string;
  subMenuEntries: SubMenuEntryProps[];
}

export class ProduktvorlagenController extends AbstractController {
  public readonly projectTemplates = TEMPLATE_DATA as TemplateProps[];
}
