import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectFeature } from 'projektassistent-api-client';
import { ProjectManualService } from '../project-manual.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-profile',
  templateUrl: './application-profile.component.html',
  styleUrls: ['./application-profile.component.scss'],
})
export class ApplicationProfileComponent implements OnInit, OnDestroy {
  features: ProjectFeature[] = [];

  projectTypeId: number;
  projectTypeVariantId: number;

  projectTypeSubscription: Subscription;
  projectTypeVariantSubscription: Subscription;

  constructor(private projectManualService: ProjectManualService) {}

  ngOnInit(): void {
    this.projectTypeSubscription = this.projectManualService.getProjectTypeId().subscribe((projectTypeId) => {
      this.projectTypeId = projectTypeId;
      this.features = this.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId);
    });

    this.projectTypeVariantSubscription = this.projectManualService
      .getProjectTypeVariantId()
      .subscribe((projectTypeVariantId) => {
        this.projectTypeVariantId = projectTypeVariantId;
        this.features = this.getProjectFeatures(this.projectTypeId, this.projectTypeVariantId);
      });
  }

  ngOnDestroy(): void {
    this.projectTypeSubscription?.unsubscribe();
    this.projectTypeVariantSubscription?.unsubscribe();
  }

  getProjectFeatures(projectTypeId: number, projectTypeVariantId: number): ProjectFeature[] {
    return (
      [
        {
          projectTypeId: -1,
          projectTypeVariantId: -1,
          projectFeatures: [],
        },
        {
          projectTypeId: 1,
          projectTypeVariantId: 1,
          projectTypeFeatures: [
            {
              id: 1,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: false,
                    title: 'Nein',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                ],
              },
              name: 'Kaufmännisches Projektmanagement',
              description: 'Ist eine kaufmännische Projektplanung und -verfolgung notwendig?',
            },
            {
              id: 2,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: false,
                    title: 'Nein',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                ],
              },
              name: 'Messung und Analyse',
              description: 'Sollen quantitative Projektkennzahlen gemessen und analysiert werden?',
            },
          ],
        },
        {
          projectTypeId: 2,
          projectTypeVariantId: 3,
          projectTypeFeatures: [
            {
              id: 3,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: false,
                    title: 'Nein',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                ],
              },
              name: 'Informationssicherheit und Datenschutz (AG)',
              description:
                'Müssen im Projekt Aspekte der Informationssicherheit (Security) oder des Datenschutzes (Privacy) berücksichtigt werden?',
            },
            {
              id: 4,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: false,
                    title: 'Nein',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                ],
              },
              name: 'Funktionssicherheit (AG)',
              description: 'Müssen im Projekt Aspekte der Funktionssicherheit (Safety) berücksichtigt werden?',
            },
          ],
        },
        {
          projectTypeId: 3,
          projectTypeVariantId: 5,
          projectTypeFeatures: [
            {
              id: 5,
              values: {
                selectedValue: null,
                possibleValues: [
                  {
                    key: false,
                    title: 'Nein',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                ],
              },
              name: 'Fertigprodukte',
              description: 'Sollen, soweit sinnvoll und möglich, Fertigprodukte evaluiert und eingesetzt werden?',
            },
            {
              id: 6,
              values: {
                selectedValue: 'Test',
                possibleValues: [
                  {
                    key: 'Test',
                    title: 'Test',
                  },
                  {
                    key: 'Test2',
                    title: 'Test2',
                  },
                ],
              },
              name: 'Betriebsübergabe (AG)',
              description: 'Wird das System nach der Entwicklung in den IT-Betrieb überführt?',
            },
          ],
        },
      ].filter((item) => item.projectTypeId === projectTypeId && item.projectTypeVariantId === projectTypeVariantId)[0]
        ?.projectTypeFeatures || []
    );
  }
}
