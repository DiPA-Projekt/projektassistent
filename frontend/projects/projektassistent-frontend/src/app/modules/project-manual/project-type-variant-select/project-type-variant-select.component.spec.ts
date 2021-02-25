import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeVariantSelectComponent } from './project-type-variant-select.component';

describe('ProjectTypeVariantSelectComponent', () => {
  let component: ProjectTypeVariantSelectComponent;
  let fixture: ComponentFixture<ProjectTypeVariantSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectTypeVariantSelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTypeVariantSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
