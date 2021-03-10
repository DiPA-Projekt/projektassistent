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
import { ApplicationProfileComponent } from './application-profile/application-profile.component';
import { ProjectTypeSelectComponent } from './project-type-select/project-type-select.component';
import { ProjectTypeVariantSelectComponent } from './project-type-variant-select/project-type-variant-select.component';

@NgModule({
  declarations: [
    ProjectManualComponent,
    NavMenuListItemComponent,
    TailoringFormComponent,
    MetaModelSelectComponent,
    ProjectComponent,
    ApplicationProfileComponent,
    ProjectTypeSelectComponent,
    ProjectTypeVariantSelectComponent,
  ],
  imports: [CommonModule, MaterialModule, ProjectManualRoutingModule, ReactiveFormsModule],
})
export class ProjectManualModule {}
