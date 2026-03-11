import { v4 as uuidv4 } from 'uuid';
import { noteFixtures } from './fixtures';
import { CreateNoteInput, Note, UpdateNoteInput } from '../types/note';

const notes = new Map<string, Note>();

export const listNotes = (): Note[] => {
  return Array.from(notes.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const getNoteById = (id: string): Note | undefined => {
  return notes.get(id);
};

export const createNote = (input: CreateNoteInput): Note => {
  const timestamp = new Date().toISOString();
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  notes.set(note.id, note);
  return note;
};

export const updateNote = (id: string, input: UpdateNoteInput): Note | undefined => {
  const existing = notes.get(id);

  if (!existing) {
    return undefined;
  }

  const updated: Note = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  notes.set(id, updated);
  return updated;
};

export const deleteNote = (id: string): boolean => {
  return notes.delete(id);
};

export const clearNotes = (): void => {
  notes.clear();
};

export const seedNotes = (): Note[] => {
  clearNotes();

  return noteFixtures.map((fixture, index) => {
    const createdAt = new Date(Date.now() + index).toISOString();
    const note: Note = {
      id: uuidv4(),
      title: fixture.title,
      content: fixture.content,
      createdAt,
      updatedAt: createdAt,
    };

    notes.set(note.id, note);
    return note;
  });
};
