import { Component, OnInit } from '@angular/core';
import { ProjectType } from 'projektassistent-api-client';
import { of } from 'rxjs';
import { ProjectManualService } from '../project-manual.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-project-type',
  templateUrl: './project-type-select.component.html',
})
export class ProjectTypeSelectComponent implements OnInit {
  projectTypes: ProjectType[];

  constructor(private projectManualService: ProjectManualService) {}

  ngOnInit(): void {
    // simulate async call
    of(this.getProjectTypes()).subscribe((projectTypes) => {
      this.projectTypes = projectTypes;
    });
  }

  getProjectTypes(): ProjectType[] {
    return [
      { id: 1, name: 'Systementwicklungsprojekt (AG)' },
      { id: 2, name: 'Systementwicklungsprojekt (AN)' },
      { id: 3, name: 'Systementwicklungsprojekt (AG/AN)' },
    ];
  }

  changeProjectType(event: MatSelectChange): void {
    this.projectManualService.setProjectTypeId(event.value);
    this.projectManualService.setProjectTypeVariantId(-1);
  }
}
