import { TestBed } from '@angular/core/testing';

import { ProjectManualService } from './project-manual.service';

describe('ProjectManualService', () => {
  let service: ProjectManualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectManualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
