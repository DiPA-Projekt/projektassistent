import { Component } from '@angular/core';

interface MetaModel {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-metal-model-select',
  templateUrl: './meta-model-select.component.html',
  styleUrls: ['./meta-model-select.component.scss'],
})
export class MetaModelSelectComponent {
  metaModels: MetaModel[] = [
    { value: 'vmxt', viewValue: 'VMXT' },
    { value: 'vmxt-bund', viewValue: 'VMXT Bund' },
    { value: 'vmxt-itz-bund', viewValue: 'VMXT ITZ Bund' },
  ];
}
