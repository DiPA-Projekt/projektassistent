import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeSelectComponent } from './project-type-select.component';

describe('ProjectTypeSelectComponent', () => {
  let component: ProjectTypeSelectComponent;
  let fixture: ComponentFixture<ProjectTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectTypeSelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
