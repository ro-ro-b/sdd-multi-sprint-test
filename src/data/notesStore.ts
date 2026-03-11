import { v4 as uuidv4 } from 'uuid';

import type { CreateNoteInput, Note, UpdateNoteInput } from '../types/note';

const notes = new Map<string, Note>();

const sortNewestFirst = (items: Note[]): Note[] => {
  return [...items].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const cloneNote = (note: Note): Note => ({ ...note });

export const notesStore = {
  list(): Note[] {
    return sortNewestFirst(Array.from(notes.values())).map(cloneNote);
  },

  getById(id: string): Note | undefined {
    const note = notes.get(id);
    return note ? cloneNote(note) : undefined;
  },

  create(input: CreateNoteInput): Note {
    const timestamp = new Date().toISOString();
    const note: Note = {
      id: uuidv4(),
      title: input.title,
      content: input.content,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    notes.set(note.id, note);
    return cloneNote(note);
  },

  update(id: string, input: UpdateNoteInput): Note | undefined {
    const existing = notes.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Note = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString()
    };

    notes.set(id, updated);
    return cloneNote(updated);
  },

  delete(id: string): boolean {
    return notes.delete(id);
  },

  reset(): void {
    notes.clear();
  }
};
