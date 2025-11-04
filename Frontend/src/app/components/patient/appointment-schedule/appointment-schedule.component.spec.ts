import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentScheduleComponent } from './appointment-schedule.component';

describe('AppointmentScheduleComponent', () => {
  let component: AppointmentScheduleComponent;
  let fixture: ComponentFixture<AppointmentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
