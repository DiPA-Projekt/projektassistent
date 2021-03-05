import { AbstractController } from '@leanup/lib/components/generic';

import ORGANISATION_ROLES from './organisation.roles.json';
import PROJECT_ROLES from './project.roles.json';
import TAILORING_ROLES from './tailoring.roles.json';

export interface OrgranisationRole {
  dependency?: string;
  label: string;
}
export interface ProjectRole {
  dependency: string;
  label?: string;
}
export interface TailoringRole {
  key: string;
  label: string;
}

export class TailoringController extends AbstractController {
  public readonly organisationRoles: OrgranisationRole[] = ORGANISATION_ROLES as OrgranisationRole[];
  public readonly projectRoles: ProjectRole[] = PROJECT_ROLES as ProjectRole[];
  public readonly tailoringRoles: TailoringRole[] = TAILORING_ROLES as TailoringRole[];

  public checkedTailorings: string[] = [];

  public getDependencyLabel(projectKey: string): string {
    const tailoringRole: TailoringRole | undefined = this.tailoringRoles.find(
      (tailoringRole: TailoringRole) => tailoringRole.key === projectKey
    );
    if (tailoringRole) {
      return tailoringRole.label;
    } else {
      return `throw new Error("Tailoring role does not found with '${projectKey}'");`;
    }
  }
}
