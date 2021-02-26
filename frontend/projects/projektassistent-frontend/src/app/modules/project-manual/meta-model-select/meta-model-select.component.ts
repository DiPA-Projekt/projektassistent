import { Component, OnInit } from '@angular/core';
import { MetaModel } from 'projektassistent-api-client';

@Component({
  selector: 'app-metal-model-select',
  templateUrl: './meta-model-select.component.html',
})
export class MetaModelSelectComponent implements OnInit {
  metaModels: MetaModel[];

  ngOnInit(): void {
    this.metaModels = this.getAvailableMetaModels();
  }

  getAvailableMetaModels(): MetaModel[] {
    return [
      { id: 1, name: 'VMXT' },
      { id: 2, name: 'VMXT Bund' },
      { id: 3, name: 'VMXT ITZ Bund' },
    ];
  }
}
