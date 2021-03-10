import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectTypeVariant } from 'projektassistent-api-client';
import { ProjectManualService } from '../project-manual.service';
import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-project-type-variant',
  templateUrl: './project-type-variant-select.component.html',
})
export class ProjectTypeVariantSelectComponent implements OnInit, OnDestroy {
  projectTypeVariants: ProjectTypeVariant[];

  projectTypeSubscription: Subscription;

  constructor(private projectManualService: ProjectManualService) {}

  ngOnInit(): void {
    this.projectTypeSubscription = this.projectManualService.getProjectTypeId().subscribe((projectTypeId) => {
      this.projectTypeVariants = this.getProjectTypeVariants(projectTypeId);
    });
  }

  ngOnDestroy(): void {
    this.projectTypeSubscription?.unsubscribe();
  }

  getProjectTypeVariants(projectTypeId: number): ProjectTypeVariant[] {
    return (
      [
        {
          projectTypeId: -1,
          projectTypeVariant: [],
        },
        {
          projectTypeId: 1,
          projectTypeVariant: [
            { id: 1, name: 'AG-Projekt mit einem Auftragnehmer' },
            { id: 2, name: 'AG-Projekt mit mehreren Auftragnehmern' },
          ],
        },
        {
          projectTypeId: 2,
          projectTypeVariant: [
            { id: 3, name: 'AN-Projekt mit Entwicklung, Weiterentwicklung oder Migration' },
            { id: 4, name: 'AN-Projekt mit Wartung und Pflege' },
          ],
        },
        {
          projectTypeId: 3,
          projectTypeVariant: [
            { id: 5, name: 'AG-AN-Projekt mit Entwicklung, Weiterentwicklung oder Migration' },
            { id: 6, name: 'AG-AN-Projekt mit Wartung und Pflege' },
          ],
        },
      ].filter((item) => item.projectTypeId === projectTypeId)[0]?.projectTypeVariant || []
    );
  }

  changeProjectTypeVariant(event: MatSelectChange): void {
    this.projectManualService.setProjectTypeVariantId(event.value);
  }
}
