import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TailoringFormComponent } from './tailoring-form/tailoring-form.component';
import { ProjectManualComponent } from './project-manual.component';
import { ProjectComponent } from './project/project.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectManualComponent,
    children: [
      { path: 'project', component: ProjectComponent },
      { path: 'tailoring', component: TailoringFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectManualRoutingModule {}
