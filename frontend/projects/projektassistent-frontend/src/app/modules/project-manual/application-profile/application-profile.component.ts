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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Messung und Analyse',
              description: 'Sollen quantitative Projektkennzahlen gemessen und analysiert werden?',
            },
            {
              id: 3,
              values: {
                selectedValue: null,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
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
                selectedValue: null,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Funktionssicherheit (AG)',
              description: 'Müssen im Projekt Aspekte der Funktionssicherheit (Safety) berücksichtigt werden?',
            },
            {
              id: 5,
              values: {
                selectedValue: true,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Fertigprodukte',
              description: 'Sollen, soweit sinnvoll und möglich, Fertigprodukte evaluiert und eingesetzt werden?',
            },
            {
              id: 6,
              values: {
                selectedValue: true,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Betriebsübergabe (AG)',
              description: 'Wird das System nach der Entwicklung in den IT-Betrieb überführt?',
            },
          ],
        },
        {
          projectTypeId: 1,
          projectTypeVariantId: 2,
          projectTypeFeatures: [
            {
              id: 1,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Messung und Analyse',
              description: 'Sollen quantitative Projektkennzahlen gemessen und analysiert werden?',
            },
            {
              id: 3,
              values: {
                selectedValue: null,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
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
                selectedValue: null,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Funktionssicherheit (AG)',
              description: 'Müssen im Projekt Aspekte der Funktionssicherheit (Safety) berücksichtigt werden?',
            },
            {
              id: 5,
              values: {
                selectedValue: true,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Fertigprodukte',
              description: 'Sollen, soweit sinnvoll und möglich, Fertigprodukte evaluiert und eingesetzt werden?',
            },
            {
              id: 6,
              values: {
                selectedValue: true,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Betriebsübergabe (AG)',
              description: 'Wird das System nach der Entwicklung in den IT-Betrieb überführt?',
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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Informationssicherheit und Datenschutz (AN)',
              description:
                'Müssen im Projekt Aspekte der Informationssicherheit (Security) oder des Datenschutzes (Privacy) berücksichtigt werden?',
            },
            {
              id: 4,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Funktionssicherheit (AN)',
              description: 'Müssen im Projekt Aspekte der Funktionssicherheit (Safety) berücksichtigt werden?',
            },
            {
              id: 10,
              values: {
                selectedValue: 'SW',
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: 'HW',
                    title: 'HW',
                  },
                  {
                    key: 'SW',
                    title: 'SW',
                  },
                  {
                    key: 'HW_SW',
                    title: 'HW und SW',
                  },
                  {
                    key: 'Integration',
                    title: 'Integration',
                  },
                ],
              },
              name: 'Projektgegenstand',
              description: 'Was ist der Entwicklungsgegenstand des Projekts?',
            },
          ],
        },
        {
          projectTypeId: 2,
          projectTypeVariantId: 4,
          projectTypeFeatures: [
            {
              id: 1,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Messung und Analyse',
              description: 'Sollen quantitative Projektkennzahlen gemessen und analysiert werden?',
            },
            {
              id: 10,
              values: {
                selectedValue: 'SW',
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: 'HW',
                    title: 'HW',
                  },
                  {
                    key: 'SW',
                    title: 'SW',
                  },
                  {
                    key: 'HW_SW',
                    title: 'HW und SW',
                  },
                  {
                    key: 'Integration',
                    title: 'Integration',
                  },
                ],
              },
              name: 'Projektgegenstand',
              description: 'Was ist der Entwicklungsgegenstand des Projekts?',
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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Fertigprodukte',
              description: 'Sollen, soweit sinnvoll und möglich, Fertigprodukte evaluiert und eingesetzt werden?',
            },
            {
              id: 6,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Betriebsübergabe (AG/AN)',
              description: 'Wird das System nach der Entwicklung in den IT-Betrieb überführt?',
            },
            {
              id: 10,
              values: {
                selectedValue: 'SW',
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: 'HW',
                    title: 'HW',
                  },
                  {
                    key: 'SW',
                    title: 'SW',
                  },
                  {
                    key: 'HW_SW',
                    title: 'HW und SW',
                  },
                  {
                    key: 'Integration',
                    title: 'Integration',
                  },
                ],
              },
              name: 'Projektgegenstand',
              description: 'Was ist der Entwicklungsgegenstand des Projekts?',
            },
          ],
        },
        {
          projectTypeId: 3,
          projectTypeVariantId: 6,
          projectTypeFeatures: [
            {
              id: 1,
              values: {
                selectedValue: false,
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
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
                    key: null,
                    title: '--',
                  },
                  {
                    key: true,
                    title: 'Ja',
                  },
                  {
                    key: false,
                    title: 'Nein',
                  },
                ],
              },
              name: 'Messung und Analyse',
              description: 'Sollen quantitative Projektkennzahlen gemessen und analysiert werden?',
            },
            {
              id: 10,
              values: {
                selectedValue: 'SW',
                possibleValues: [
                  {
                    key: null,
                    title: '--',
                  },
                  {
                    key: 'HW',
                    title: 'HW',
                  },
                  {
                    key: 'SW',
                    title: 'SW',
                  },
                  {
                    key: 'HW_SW',
                    title: 'HW und SW',
                  },
                  {
                    key: 'Integration',
                    title: 'Integration',
                  },
                ],
              },
              name: 'Projektgegenstand',
              description: 'Was ist der Entwicklungsgegenstand des Projekts?',
            },
          ],
        },
      ].filter((item) => item.projectTypeId === projectTypeId && item.projectTypeVariantId === projectTypeVariantId)[0]
        ?.projectTypeFeatures || []
    );
  }
}