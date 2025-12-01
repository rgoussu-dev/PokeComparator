import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Imposter } from './imposter';

describe('Imposter', () => {
  let component: Imposter;
  let fixture: ComponentFixture<Imposter>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Imposter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Imposter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
