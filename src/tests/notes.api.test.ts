import request from 'supertest';

import app from '../app';
import { notesStore } from '../data/notesStore';
import type { Note } from '../types/note';

const fixtures = [
  { title: 'First Note', content: 'Hello world content' },
  { title: 'Meeting Notes', content: 'Discussed project timeline and deliverables' },
  { title: 'Shopping List', content: 'Milk, eggs, bread, butter' }
];

describe('Notes API', () => {
  beforeEach(() => {
    notesStore.reset();
    vi.useRealTimers();
  });

  describe('GET /api/notes', () => {
    it('lists all notes newest first', async () => {
      vi.useFakeTimers();

      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const first = notesStore.create(fixtures[0]);
      vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
      const second = notesStore.create(fixtures[1]);
      vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'));
      const third = notesStore.create(fixtures[2]);

      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body.map((note: Note) => note.id)).toEqual([third.id, second.id, first.id]);
    });

    it('returns an empty array when there are no notes', async () => {
      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('gets a single note by id', async () => {
      const note = notesStore.create(fixtures[0]);

      const response = await request(app).get(`/api/notes/${note.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(note);
    });

    it('returns 404 when a note does not exist', async () => {
      const response = await request(app).get('/api/notes/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Note not found' });
    });

    it('returns 404 for invalid uuid on get', async () => {
      const response = await request(app).get('/api/notes/not-a-uuid');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Note not found' });
    });
  });

  describe('POST /api/notes', () => {
    it('creates a new note', async () => {
      const payload = fixtures[0];

      const response = await request(app).post('/api/notes').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(payload.title);
      expect(response.body.content).toBe(payload.content);
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(response.body.createdAt).toBeTypeOf('string');
      expect(response.body.updatedAt).toBeTypeOf('string');
      expect(response.body.createdAt).toBe(response.body.updatedAt);

      const stored = notesStore.getById(response.body.id);
      expect(stored).toEqual(response.body);
    });

    it('returns 400 for invalid create payloads', async () => {
      const cases = [
        null,
        {},
        { title: '', content: 'content' },
        { title: 'title', content: '' },
        { title: 123, content: 'content' },
        { title: 'title', content: 123 },
        { title: 't'.repeat(201), content: 'content' },
        { title: 'title', content: 'c'.repeat(5001) }
      ];

      for (const payload of cases) {
        const response = await request(app).post('/api/notes').send(payload as object);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Missing or invalid fields' });
      }
    });

    it('accepts payloads at maximum allowed lengths', async () => {
      const payload = { title: 't'.repeat(200), content: 'c'.repeat(5000) };

      const response = await request(app).post('/api/notes').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(payload.title);
      expect(response.body.content).toBe(payload.content);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('updates both title and content', async () => {
      const note = notesStore.create(fixtures[0]);

      const response = await request(app)
        .put(`/api/notes/${note.id}`)
        .send({ title: 'Updated title', content: 'Updated content' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(note.id);
      expect(response.body.title).toBe('Updated title');
      expect(response.body.content).toBe('Updated content');
      expect(response.body.createdAt).toBe(note.createdAt);
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(note.updatedAt).getTime());
    });

    it('updates only the provided title', async () => {
      const note = notesStore.create(fixtures[0]);

      const response = await request(app).put(`/api/notes/${note.id}`).send({ title: 'Updated title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated title');
      expect(response.body.content).toBe(note.content);
    });

    it('updates only the provided content', async () => {
      const note = notesStore.create(fixtures[0]);

      const response = await request(app).put(`/api/notes/${note.id}`).send({ content: 'Updated content' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(note.title);
      expect(response.body.content).toBe('Updated content');
    });

    it('returns 404 for invalid uuid on update', async () => {
      const response = await request(app).put('/api/notes/not-a-uuid').send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Note not found' });
    });

    it('returns 404 when updating a missing note', async () => {
      const response = await request(app)
        .put('/api/notes/550e8400-e29b-41d4-a716-446655440000')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Note not found' });
    });

    it('returns 400 when no updatable fields are provided', async () => {
      const note = notesStore.create(fixtures[0]);

      const response = await request(app).put(`/api/notes/${note.id}`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'No fields provided' });
    });

    it('returns 400 for invalid update fields', async () => {
      const note = notesStore.create(fixtures[0]);

      const cases = [
        { title: '' },
        { content: '' },
        { title: 123 },
        { content: 123 },
        { title: 't'.repeat(201) },
        { content: 'c'.repeat(5001) }
      ];

      for (const payload of cases) {
        const response = await request(app).put(`/api/notes/${note.id}`).send(payload as object);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid fields' });
      }
    });

    it('accepts update payloads at maximum allowed lengths', async () => {
      const note = notesStore.create(fixtures[0]);
      const payload = { title: 't'.repeat(200), content: 'c'.repeat(5000) };

      const response = await request(app).put(`/api/notes/${note.id}`).send(payload);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(payload.title);
      expect(response.body.content).toBe(payload.content);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('deletes an existing note', async () => {
      const note = notesStore.create(fixtures[0]);

      const response = await request(app).delete(`/api/notes/${note.id}`);

      expect(response.status).toBe(204);
      expect(response.text).toBe('');
      expect(notesStore.getById(note.id)).toBeUndefined();
    });

    it('returns 404 for invalid uuid on delete', async () => {
      const response = await request(app).delete('/api/notes/not-a-uuid');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Note not found' });
    });

    it('returns 404 when deleting a missing note', async () => {
      const response = await request(app).delete('/api/notes/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Note not found' });
    });
  });
});
