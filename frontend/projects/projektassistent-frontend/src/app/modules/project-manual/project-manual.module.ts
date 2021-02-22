import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManualRoutingModule } from './project-manual-routing.module';
import { TailoringFormComponent } from './tailoring-form/tailoring-form.component';
import { ProjectManualComponent } from './project-manual.component';
import { MaterialModule } from '../../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NavMenuListItemComponent } from '../../shared/nav-menu-list-item/nav-menu-list-item.component';
import { MetaModelSelectComponent } from './meta-model-select/meta-model-select.component';
import { ProjectComponent } from './project/project.component';

@NgModule({
  declarations: [ProjectManualComponent, NavMenuListItemComponent, TailoringFormComponent, MetaModelSelectComponent, ProjectComponent],
  imports: [CommonModule, MaterialModule, ProjectManualRoutingModule, ReactiveFormsModule],
})
export class ProjectManualModule {}
