import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectType } from 'projektassistent-api-client';
import { Subscription } from 'rxjs';
import { ProjectManualService } from '../project-manual.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-project-type',
  templateUrl: './project-type-select.component.html',
})
export class ProjectTypeSelectComponent implements OnInit, OnDestroy {
  projectTypes: ProjectType[];

  metaModelSubscription: Subscription;

  constructor(private projectManualService: ProjectManualService) {}

  ngOnInit(): void {
    this.metaModelSubscription = this.projectManualService.getMetaModelId().subscribe((metaModelId) => {
      this.projectTypes = this.getProjectTypes(metaModelId);
    });
  }

  ngOnDestroy(): void {
    this.metaModelSubscription?.unsubscribe();
  }

  getProjectTypes(metaModelId: number): ProjectType[] {
    return (
      [
        {
          metaModelId: 1,
          projectType: [
            { id: 1, name: 'Systementwicklungsprojekt (AG)' },
            { id: 2, name: 'Systementwicklungsprojekt (AN)' },
            { id: 3, name: 'Systementwicklungsprojekt (AG/AN)' },
          ],
        },
        {
          metaModelId: 2,
          projectType: [
            { id: 1, name: 'Systementwicklungsprojekt (AG) Bund' },
            { id: 3, name: 'Systementwicklungsprojekt (AG/AN) Bund' },
          ],
        },
        {
          metaModelId: 3,
          projectType: [
            { id: 1, name: 'Systementwicklungsprojekt (AG) ITZ-Bund' },
            { id: 2, name: 'Systementwicklungsprojekt (AN) ITZ-Bund' },
          ],
        },
      ].filter((item) => item.metaModelId === metaModelId)[0]?.projectType || []
    );
  }

  changeProjectType(event: MatSelectChange): void {
    this.projectManualService.setProjectTypeId(event.value);
    this.projectManualService.setProjectTypeVariantId(-1);
  }
}
