import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguiminetoComponent } from './seguimineto.component';

describe('SeguiminetoComponent', () => {
  let component: SeguiminetoComponent;
  let fixture: ComponentFixture<SeguiminetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguiminetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguiminetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
