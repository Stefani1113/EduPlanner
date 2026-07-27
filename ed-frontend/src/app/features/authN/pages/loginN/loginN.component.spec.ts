import { ComponentFixture, TestBed } from '@angular/core/testing';

import { login-new_contraseñaComponent } from './login-new_contraseña.component';

describe('LoginComponent', () => {
  let component: login-new_contraseñaComponent;
  let fixture: ComponentFixture<login-new_contraseñaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [login-new_contraseñaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(login-new_contraseñaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
