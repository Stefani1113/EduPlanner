import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergenciaComponent } from './emergencia.component';

describe('EmergenciaComponent', () => {
  let component: EmergenciaComponent;
  let fixture: ComponentFixture<EmergenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
