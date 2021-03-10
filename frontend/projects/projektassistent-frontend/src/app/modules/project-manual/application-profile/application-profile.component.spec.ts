import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationProfileComponent } from './application-profile.component';

describe('ApplicationProfileComponent', () => {
  let component: ApplicationProfileComponent;
  let fixture: ComponentFixture<ApplicationProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationProfileComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
