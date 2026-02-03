import { Note } from './note.model';

describe('Note Interface', () => {
  it('should create a note object', () => {
    const note: Note = {
      id: '1',
      parentId: 'f1',
      title: 'Test Note',
      content: 'Hello World',
      createdAt: ''
    };
    expect(note.title).toBe('Test Note');
  });
});