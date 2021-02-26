import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaModelSelectComponent } from './meta-model-select.component';

describe('MetalModelSelectComponent', () => {
  let component: MetaModelSelectComponent;
  let fixture: ComponentFixture<MetaModelSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetaModelSelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaModelSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
