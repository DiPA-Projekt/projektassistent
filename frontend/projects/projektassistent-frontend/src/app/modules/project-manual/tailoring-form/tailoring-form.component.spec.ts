import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailoringFormComponent } from './tailoring-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatPseudoCheckboxModule, MatRippleModule } from '@angular/material/core';

describe('TailoringFormComponent', () => {
  let component: TailoringFormComponent;
  let fixture: ComponentFixture<TailoringFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TailoringFormComponent, MatIcon, MatToolbar, MatToolbarRow, MatSelectionList, MatListOption],
      imports: [ReactiveFormsModule, MatRippleModule, MatPseudoCheckboxModule],
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
