import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearNotes,
  createNote,
  deleteNote,
  getCategoryCounts,
  getNoteById,
  listNotes,
  seedNotes,
  updateNote,
  updateNoteCategory,
} from '../data/notesStore';

describe('notesStore', () => {
  beforeEach(() => {
    clearNotes();
  });

  it('starts empty after clearNotes', () => {
    expect(listNotes()).toEqual([]);
    expect(getCategoryCounts()).toEqual([
      { name: 'personal', count: 0 },
      { name: 'work', count: 0 },
      { name: 'ideas', count: 0 },
      { name: 'archive', count: 0 },
    ]);
  });

  it('createNote creates a note with id and timestamps', () => {
    const note = createNote({ title: 'Title', content: 'Content', category: 'personal' });

    expect(note.id).toEqual(expect.any(String));
    expect(note.title).toBe('Title');
    expect(note.content).toBe('Content');
    expect(note.category).toBe('personal');
    expect(note.createdAt).toEqual(expect.any(String));
    expect(note.updatedAt).toEqual(expect.any(String));
    expect(note.createdAt).toBe(note.updatedAt);

    expect(getNoteById(note.id)).toEqual(note);
  });

  it('createNote supports notes without category', () => {
    const note = createNote({ title: 'Title', content: 'Content' });
    expect(note.category).toBeUndefined();
  });

  it('listNotes returns notes newest first', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const first = createNote({ title: 'First', content: 'One', category: 'personal' });

      vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
      const second = createNote({ title: 'Second', content: 'Two', category: 'work' });

      vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'));
      const third = createNote({ title: 'Third', content: 'Three', category: 'ideas' });

      expect(listNotes().map((note) => note.id)).toEqual([third.id, second.id, first.id]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('listNotes filters by category', () => {
    createNote({ title: 'Personal', content: 'One', category: 'personal' });
    createNote({ title: 'Work', content: 'Two', category: 'work' });
    createNote({ title: 'No category', content: 'Three' });

    const workNotes = listNotes('work');
    expect(workNotes).toHaveLength(1);
    expect(workNotes[0].title).toBe('Work');
  });

  it('getNoteById returns undefined for missing note', () => {
    expect(getNoteById('missing')).toBeUndefined();
  });

  it('updateNote updates provided fields and changes updatedAt only', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const note = createNote({ title: 'Title', content: 'Content', category: 'personal' });

      vi.setSystemTime(new Date('2024-01-01T00:00:05.000Z'));
      const updated = updateNote(note.id, { title: 'Updated title' });

      expect(updated).toMatchObject({
        id: note.id,
        title: 'Updated title',
        content: 'Content',
        category: 'personal',
        createdAt: note.createdAt,
      });
      expect(updated?.updatedAt).not.toBe(note.updatedAt);
      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
        new Date(note.updatedAt).getTime(),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('updateNote returns undefined for missing note', () => {
    expect(updateNote('missing', { title: 'Updated' })).toBeUndefined();
  });

  it('updateNoteCategory updates category and updatedAt', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const note = createNote({ title: 'Title', content: 'Content', category: 'personal' });

      vi.setSystemTime(new Date('2024-01-01T00:00:10.000Z'));
      const updated = updateNoteCategory(note.id, 'archive');

      expect(updated).toMatchObject({
        id: note.id,
        title: 'Title',
        content: 'Content',
        category: 'archive',
        createdAt: note.createdAt,
      });
      expect(updated?.updatedAt).not.toBe(note.updatedAt);
    } finally {
      vi.useRealTimers();
    }
  });

  it('updateNoteCategory returns undefined for missing note', () => {
    expect(updateNoteCategory('missing', 'archive')).toBeUndefined();
  });

  it('getCategoryCounts returns counts for all categories including zeroes', () => {
    createNote({ title: 'A', content: 'A', category: 'personal' });
    createNote({ title: 'B', content: 'B', category: 'personal' });
    createNote({ title: 'C', content: 'C', category: 'archive' });
    createNote({ title: 'D', content: 'D' });

    expect(getCategoryCounts()).toEqual([
      { name: 'personal', count: 2 },
      { name: 'work', count: 0 },
      { name: 'ideas', count: 0 },
      { name: 'archive', count: 1 },
    ]);
  });

  it('deleteNote removes an existing note and returns true', () => {
    const note = createNote({ title: 'Title', content: 'Content' });

    expect(deleteNote(note.id)).toBe(true);
    expect(getNoteById(note.id)).toBeUndefined();
  });

  it('deleteNote returns false for missing note', () => {
    expect(deleteNote('missing')).toBe(false);
  });

  it('seedNotes resets existing notes and loads fixtures', () => {
    createNote({ title: 'Existing', content: 'Should be cleared', category: 'archive' });

    const seeded = seedNotes();

    expect(seeded).toHaveLength(3);
    expect(listNotes()).toHaveLength(3);
    expect(listNotes().map((note) => note.title)).toEqual([
      'App Idea',
      'Meeting Notes',
      'First Note',
    ]);
    expect(getCategoryCounts()).toEqual([
      { name: 'personal', count: 1 },
      { name: 'work', count: 1 },
      { name: 'ideas', count: 1 },
      { name: 'archive', count: 0 },
    ]);
  });
});
