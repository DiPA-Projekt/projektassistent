import { TableEntry } from '@dipa-projekt/projektassistent-openapi';
import { AbstractController } from '@leanup/lib/components/generic';

import PAGES_DATA from './pages.data.json';

// Tiny helper interface
interface PageEntry {
  id: number;
  menuEntryId: number;
  header: string;
  descriptionText: string;
  tableEntries: TableEntry[];
}

export class ContentController extends AbstractController {
  public collapsed = false;

  public pageEntry: PageEntry | undefined;

  public onInit(): void {
    const paramId = this.pageEntry?.id || 1;
    this.pageEntry = this.getPageEntryContent(paramId);
  }

  public onDestroy(): void {}

  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  public getPageEntryContent(menuEntryId: number): PageEntry {
    // const { id } = useParams();
    const pageEntry = PAGES_DATA.find((item) => item.menuEntryId === menuEntryId);
    return pageEntry as PageEntry;
  }
}
