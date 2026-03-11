import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';
import { clearNotes, createNote } from '../data/notesStore';

describe('Categories API', () => {
  beforeEach(() => {
    clearNotes();
  });

  afterEach(() => {
    clearNotes();
  });

  it('GET /api/categories returns all categories with zero counts when empty', async () => {
    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { name: 'personal', count: 0 },
      { name: 'work', count: 0 },
      { name: 'ideas', count: 0 },
      { name: 'archive', count: 0 },
    ]);
  });

  it('GET /api/categories returns updated counts after note changes', async () => {
    createNote({ title: 'One', content: 'One', category: 'personal' });
    createNote({ title: 'Two', content: 'Two', category: 'personal' });
    createNote({ title: 'Three', content: 'Three', category: 'work' });
    createNote({ title: 'Four', content: 'Four' });

    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { name: 'personal', count: 2 },
      { name: 'work', count: 1 },
      { name: 'ideas', count: 0 },
      { name: 'archive', count: 0 },
    ]);
  });
});
