import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationListComponent } from './medication-list.component';

describe('MedicationListComponent', () => {
  let component: MedicationListComponent;
  let fixture: ComponentFixture<MedicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
