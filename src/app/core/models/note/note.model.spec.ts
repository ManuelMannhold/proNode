import { TestBed } from '@angular/core/testing';

import { NoteModel } from './note.model';

describe('NoteModel', () => {
  let service: NoteModel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteModel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
