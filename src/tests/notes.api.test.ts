import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import app from '../app';
import { clearNotes, createNote, getNoteById, seedNotes } from '../data/notesStore';

describe('Notes API', () => {
  beforeEach(() => {
    seedNotes();
  });

  afterEach(() => {
    clearNotes();
  });

  it('GET /api/notes returns seeded notes newest first', async () => {
    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].title).toBe('App Idea');
    expect(response.body[1].title).toBe('Meeting Notes');
    expect(response.body[2].title).toBe('First Note');
  });

  it('GET /api/notes returns an empty array when there are no notes', async () => {
    clearNotes();

    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /api/notes filters by category', async () => {
    const response = await request(app).get('/api/notes').query({ category: 'work' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Meeting Notes');
    expect(response.body[0].category).toBe('work');
  });

  it('GET /api/notes returns empty array for valid category with no matches', async () => {
    const response = await request(app).get('/api/notes').query({ category: 'archive' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /api/notes returns 400 for invalid category filter', async () => {
    const response = await request(app).get('/api/notes').query({ category: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid category' });
  });

  it('GET /api/categories returns category counts', async () => {
    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { name: 'personal', count: 1 },
      { name: 'work', count: 1 },
      { name: 'ideas', count: 1 },
      { name: 'archive', count: 0 },
    ]);
  });

  it('GET /api/notes/:id returns a note by id', async () => {
    const [note] = seedNotes();

    const response = await request(app).get(`/api/notes/${note.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(note.id);
    expect(response.body.title).toBe(note.title);
    expect(response.body.content).toBe(note.content);
    expect(response.body.category).toBe(note.category);
  });

  it('GET /api/notes/:id returns 404 for invalid uuid', async () => {
    const response = await request(app).get('/api/notes/not-a-uuid');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('GET /api/notes/:id returns 404 when note does not exist', async () => {
    const response = await request(app).get(`/api/notes/${uuidv4()}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('POST /api/notes creates a note with required fields only', async () => {
    const response = await request(app).post('/api/notes').send({
      title: 'New note',
      content: 'New content',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'New note',
      content: 'New content',
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));
    expect(response.body.createdAt).toBe(response.body.updatedAt);
  });

  it('POST /api/notes creates a note with category', async () => {
    const response = await request(app).post('/api/notes').send({
      title: 'New note',
      content: 'New content',
      category: 'archive',
    });

    expect(response.status).toBe(201);
    expect(response.body.category).toBe('archive');
  });

  it('POST /api/notes returns 400 for missing fields', async () => {
    const response = await request(app).post('/api/notes').send({ title: 'Only title' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing or invalid fields' });
  });

  it('POST /api/notes returns 400 for invalid fields', async () => {
    const invalidBodies = [
      { title: '', content: 'Content' },
      { title: 'Title', content: '' },
      { title: 'a'.repeat(201), content: 'Content' },
      { title: 'Title', content: 'a'.repeat(5001) },
      { title: 'Title', content: 'Content', category: 'invalid' },
      null,
      [],
    ];

    for (const body of invalidBodies) {
      const response = await request(app).post('/api/notes').send(body as never);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing or invalid fields' });
    }
  });

  it('PUT /api/notes/:id updates title and content', async () => {
    const note = createNote({ title: 'Old title', content: 'Old content', category: 'personal' });

    const response = await request(app).put(`/api/notes/${note.id}`).send({
      title: 'Updated title',
      content: 'Updated content',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: note.id,
      title: 'Updated title',
      content: 'Updated content',
      category: 'personal',
      createdAt: note.createdAt,
    });
    expect(response.body.updatedAt).not.toBe(note.updatedAt);
  });

  it('PUT /api/notes/:id supports partial updates', async () => {
    const note = createNote({ title: 'Old title', content: 'Old content', category: 'work' });

    const response = await request(app).put(`/api/notes/${note.id}`).send({
      title: 'Updated title',
    });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated title');
    expect(response.body.content).toBe('Old content');
    expect(response.body.category).toBe('work');
  });

  it('PUT /api/notes/:id returns 404 for invalid uuid', async () => {
    const response = await request(app).put('/api/notes/not-a-uuid').send({
      title: 'Updated title',
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('PUT /api/notes/:id returns 404 when note does not exist', async () => {
    const response = await request(app).put(`/api/notes/${uuidv4()}`).send({
      title: 'Updated title',
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('PUT /api/notes/:id returns 400 when no fields are provided', async () => {
    const note = createNote({ title: 'Title', content: 'Content' });

    const response = await request(app).put(`/api/notes/${note.id}`).send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'No fields provided' });
  });

  it('PUT /api/notes/:id returns 400 for invalid update fields', async () => {
    const note = createNote({ title: 'Title', content: 'Content' });

    const invalidBodies = [
      { title: '' },
      { content: '' },
      { title: 'a'.repeat(201) },
      { content: 'a'.repeat(5001) },
      { title: 'Updated', extra: 'field' },
    ];

    for (const body of invalidBodies) {
      const response = await request(app).put(`/api/notes/${note.id}`).send(body);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing or invalid fields' });
    }
  });

  it('PATCH /api/notes/:id/category updates only the category', async () => {
    const note = createNote({ title: 'Title', content: 'Content', category: 'personal' });

    const response = await request(app)
      .patch(`/api/notes/${note.id}/category`)
      .send({ category: 'archive' });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(note.id);
    expect(response.body.title).toBe('Title');
    expect(response.body.content).toBe('Content');
    expect(response.body.category).toBe('archive');
    expect(response.body.createdAt).toBe(note.createdAt);
    expect(response.body.updatedAt).not.toBe(note.updatedAt);
  });

  it('PATCH /api/notes/:id/category returns 404 for invalid uuid', async () => {
    const response = await request(app)
      .patch('/api/notes/not-a-uuid/category')
      .send({ category: 'archive' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('PATCH /api/notes/:id/category returns 404 when note does not exist', async () => {
    const response = await request(app)
      .patch(`/api/notes/${uuidv4()}/category`)
      .send({ category: 'archive' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('PATCH /api/notes/:id/category returns 400 for invalid category payload', async () => {
    const note = createNote({ title: 'Title', content: 'Content', category: 'personal' });

    const invalidBodies = [{}, { category: 'invalid' }, { category: '' }, null, []];

    for (const body of invalidBodies) {
      const response = await request(app)
        .patch(`/api/notes/${note.id}/category`)
        .send(body as never);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid category' });
    }
  });

  it('DELETE /api/notes/:id deletes a note and returns 204 with empty body', async () => {
    const note = createNote({ title: 'Delete me', content: 'Soon gone' });

    const response = await request(app).delete(`/api/notes/${note.id}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(getNoteById(note.id)).toBeUndefined();
  });

  it('DELETE /api/notes/:id returns 404 for invalid uuid', async () => {
    const response = await request(app).delete('/api/notes/not-a-uuid');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('DELETE /api/notes/:id returns 404 when note does not exist', async () => {
    const response = await request(app).delete(`/api/notes/${uuidv4()}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });
});
