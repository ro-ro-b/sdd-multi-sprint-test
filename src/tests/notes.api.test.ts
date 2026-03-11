import request from 'supertest';
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
    expect(response.body[0].title).toBe('Shopping List');
    expect(response.body[1].title).toBe('Meeting Notes');
    expect(response.body[2].title).toBe('First Note');
  });

  it('GET /api/notes/:id returns a note by id', async () => {
    const [note] = seedNotes();

    const response = await request(app).get(`/api/notes/${note.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(note.id);
    expect(response.body.title).toBe(note.title);
    expect(response.body.content).toBe(note.content);
  });

  it('GET /api/notes/:id returns 404 for invalid uuid', async () => {
    const response = await request(app).get('/api/notes/not-a-uuid');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('GET /api/notes/:id returns 404 when note does not exist', async () => {
    const response = await request(app).get(
      '/api/notes/11111111-1111-4111-8111-111111111111',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('POST /api/notes creates a note', async () => {
    const payload = {
      title: 'New Note',
      content: 'This is a new note',
    };

    const response = await request(app).post('/api/notes').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(payload.title);
    expect(response.body.content).toBe(payload.content);
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));
    expect(response.body.createdAt).toBe(response.body.updatedAt);
  });

  it('POST /api/notes returns 400 for missing fields', async () => {
    const response = await request(app).post('/api/notes').send({ title: 'Only title' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing or invalid fields' });
  });

  it('POST /api/notes returns 400 for max length violations', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'a'.repeat(201), content: 'valid content' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing or invalid fields' });
  });

  it('PUT /api/notes/:id updates a note and changes updatedAt', async () => {
    const note = createNote({ title: 'Original', content: 'Original content' });

    await new Promise((resolve) => setTimeout(resolve, 5));

    const response = await request(app)
      .put(`/api/notes/${note.id}`)
      .send({ title: 'Updated', content: 'Updated content' });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(note.id);
    expect(response.body.title).toBe('Updated');
    expect(response.body.content).toBe('Updated content');
    expect(response.body.createdAt).toBe(note.createdAt);
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
      new Date(note.updatedAt).getTime(),
    );
  });

  it('PUT /api/notes/:id returns 400 when no fields are provided', async () => {
    const note = createNote({ title: 'Original', content: 'Original content' });

    const response = await request(app).put(`/api/notes/${note.id}`).send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'No fields provided' });
  });

  it('PUT /api/notes/:id returns 404 for invalid uuid', async () => {
    const response = await request(app).put('/api/notes/not-a-uuid').send({ title: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('PUT /api/notes/:id returns 404 when note does not exist', async () => {
    const response = await request(app)
      .put('/api/notes/11111111-1111-4111-8111-111111111111')
      .send({ title: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('DELETE /api/notes/:id deletes a note', async () => {
    const note = createNote({ title: 'Delete me', content: 'Delete this note' });

    const response = await request(app).delete(`/api/notes/${note.id}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(getNoteById(note.id)).toBeUndefined();
  });

  it('DELETE /api/notes/:id returns 404 when note does not exist', async () => {
    const response = await request(app).delete(
      '/api/notes/11111111-1111-4111-8111-111111111111',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });
});
