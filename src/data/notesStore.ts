import { v4 as uuidv4 } from 'uuid';
import type { CreateNoteInput, Note, UpdateNoteInput } from '../types/note';

const fixtureNotes: CreateNoteInput[] = [
  { title: 'First Note', content: 'Hello world content' },
  {
    title: 'Meeting Notes',
    content: 'Discussed project timeline and deliverables'
  },
  { title: 'Shopping List', content: 'Milk, eggs, bread, butter' }
];

const notes = new Map<string, Note>();

function seedNotes(): void {
  notes.clear();

  fixtureNotes.forEach((note, index) => {
    const timestamp = new Date(Date.now() - (fixtureNotes.length - index) * 1000).toISOString();
    const seededNote: Note = {
      id: uuidv4(),
      title: note.title,
      content: note.content,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    notes.set(seededNote.id, seededNote);
  });
}

seedNotes();

export function resetNotesStore(): void {
  seedNotes();
}

export function listNotes(): Note[] {
  return Array.from(notes.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getNoteById(id: string): Note | undefined {
  return notes.get(id);
}

export function createNote(input: CreateNoteInput): Note {
  const now = new Date().toISOString();
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content,
    createdAt: now,
    updatedAt: now
  };

  notes.set(note.id, note);
  return note;
}

export function updateNote(id: string, input: UpdateNoteInput): Note | undefined {
  const existing = notes.get(id);

  if (!existing) {
    return undefined;
  }

  const updated: Note = {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    updatedAt: new Date().toISOString()
  };

  notes.set(id, updated);
  return updated;
}

export function deleteNote(id: string): boolean {
  return notes.delete(id);
}
