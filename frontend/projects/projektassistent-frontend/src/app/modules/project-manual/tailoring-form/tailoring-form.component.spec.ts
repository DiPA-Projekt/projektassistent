import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailoringFormComponent } from './tailoring-form.component';

describe('TailoringFormComponent', () => {
  let component: TailoringFormComponent;
  let fixture: ComponentFixture<TailoringFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TailoringFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TailoringFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
