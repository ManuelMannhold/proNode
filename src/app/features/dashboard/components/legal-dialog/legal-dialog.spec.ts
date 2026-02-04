import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalDialog } from './legal-dialog';

describe('LegalDialog', () => {
  let component: LegalDialog;
  let fixture: ComponentFixture<LegalDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
