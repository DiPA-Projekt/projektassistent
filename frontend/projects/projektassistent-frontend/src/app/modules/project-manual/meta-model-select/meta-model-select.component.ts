import { Component, OnInit } from '@angular/core';
import { MetaModel } from 'projektassistent-api-client';
import { MatSelectChange } from '@angular/material/select';
import { ProjectManualService } from '../project-manual.service';

@Component({
  selector: 'app-metal-model-select',
  templateUrl: './meta-model-select.component.html',
})
export class MetaModelSelectComponent implements OnInit {
  metaModels: MetaModel[];

  constructor(private projectManualService: ProjectManualService) {}

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

  changeMetaModel(event: MatSelectChange): void {
    this.projectManualService.setMetaModelId(event.value);
    this.projectManualService.setProjectTypeId(-1);
    this.projectManualService.setProjectTypeVariantId(-1);
  }
}
