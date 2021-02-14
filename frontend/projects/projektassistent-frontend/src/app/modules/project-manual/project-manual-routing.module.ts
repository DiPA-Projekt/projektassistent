import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TailoringFormComponent } from './tailoring-form/tailoring-form.component';
import { ProjectManualComponent } from './project-manual.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectManualComponent,
    children: [{ path: 'tailoring', component: TailoringFormComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectManualRoutingModule {}
