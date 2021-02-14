import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-tailoring-form',
  templateUrl: './tailoring-form.component.html',
  styleUrls: ['./tailoring-form.component.scss'],
})
export class TailoringFormComponent {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  tailoringOptions: { key: string; label: string }[] = [
    {
      key: 'OPTION_PROJ_MGMNT',
      label: 'Kaufmännisches Projektmanagement',
    },
    {
      key: 'OPTION_MEAS_ANAL',
      label: 'Messung und Analyse',
    },
    {
      key: 'OPTION_INFO_SEC_N_PROJ_DATA_PROT',
      label: 'Informationssicherheit und Datenschutz (AG)',
    },
    {
      key: 'OPTION_FUNC_RELY',
      label: 'Funktionssicherheit (AG)',
    },
    {
      key: 'OPTION_FIN_PROD',
      label: 'Fertigprodukte',
    },
    {
      key: 'OPTION_HANDOVER',
      label: 'Betriebsübergabe (AG)',
    },
  ];

  // Projektrollen

  projectRoles: { label: string; dependency?: string }[] = [
    {
      label: 'Änderungssteuerungsgruppe (Change Control Board)',
    },
    {
      label: 'Anforderungsanalytiker (AG)',
    },
    {
      label: 'Anwender',
    },
    {
      label: 'Ausschreibungsverantwortlicher',
    },
    {
      label: 'KM-Administrator',
    },
    {
      label: 'Lenkungsausschluss',
    },
    {
      label: 'Projektleiter',
    },
    {
      label: 'Prüfer',
    },
    {
      label: 'Projektmanager',
    },
    {
      label: 'QS-Verantwortlicher',
    },
    {
      label: 'Projektkaufmann',
      dependency: 'OPTION_PROJ_MGMNT',
    },
    {
      label: 'Datenschutzverantwortlicher',
      dependency: 'OPTION_INFO_SEC_N_PROJ_DATA_PROT',
    },
    {
      label: 'Fachverantwortlicher',
      dependency: 'OPTION_INFO_SEC_N_PROJ_DATA_PROT',
    },
    {
      label: 'Informationssicherheitsverantwortlicher',
      dependency: 'OPTION_INFO_SEC_N_PROJ_DATA_PROT',
    },
    {
      label: 'Betriebsverantwortlicher',
      dependency: 'OPTION_HANDOVER',
    },
    {
      label: 'Verfahrensverantwortlicher (Fachseite)',
      dependency: 'OPTION_HANDOVER',
    },
    {
      label: 'Verfahrensverantwortlicher (IT-Betrieb)',
      dependency: 'OPTION_HANDOVER',
    },
    {
      label: 'Verfahrensverantwortlicher (Weiterentwicklung)',
      dependency: 'OPTION_HANDOVER',
    },
  ];

  // Organisationsrollen

  organisationRoles: { label: string; dependency?: string }[] = [
    {
      label: 'Einkäufer',
    },
    {
      label: 'Qualitätsmanager',
    },
    {
      label: 'Datenschutzbeauftragter (Organisation)',
      dependency: 'OPTION_INFO_SEC_N_PROJ_DATA_PROT',
    },
    {
      label: 'Informationssicherheitsbeauftragter (Organisation)',
      dependency: 'OPTION_INFO_SEC_N_PROJ_DATA_PROT',
    },
    {
      label: 'Betriebsbeauftragter (Organisation)',
      dependency: 'OPTION_HANDOVER',
    },
  ];

  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      tailoringList: '',
    });
  }

  getDependencyLabel(dependency: string): string {
    return this.tailoringOptions.find((x: { key: string; label: string }) => x.key === dependency).label;
  }
}
