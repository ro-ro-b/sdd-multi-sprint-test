import request from 'supertest';
import { describe, beforeEach, it, expect } from 'vitest';
import app from '../app';
import { getNoteById, listNotes, resetNotesStore } from '../data/notesStore';

describe('Notes API', () => {
  beforeEach(() => {
    resetNotesStore();
  });

  it('lists all notes newest first', async () => {
    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].title).toBe('Shopping List');
    expect(response.body[1].title).toBe('Meeting Notes');
    expect(response.body[2].title).toBe('First Note');
  });

  it('gets a single note by id', async () => {
    const note = listNotes()[0];
    const response = await request(app).get(`/api/notes/${note.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(note.id);
    expect(response.body.title).toBe(note.title);
  });

  it('returns 404 when note is not found', async () => {
    const response = await request(app).get('/api/notes/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });

  it('creates a new note', async () => {
    const response = await request(app).post('/api/notes').send({
      title: 'New Note',
      content: 'New content'
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeTypeOf('string');
    expect(response.body.title).toBe('New Note');
    expect(response.body.content).toBe('New content');
    expect(response.body.createdAt).toBeTypeOf('string');
    expect(response.body.updatedAt).toBeTypeOf('string');
  });

  it('returns 400 for invalid create payload', async () => {
    const response = await request(app).post('/api/notes').send({
      title: '',
      content: 'Valid content'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing or invalid fields' });
  });

  it('updates an existing note and changes updatedAt', async () => {
    const note = listNotes()[0];
    const response = await request(app).put(`/api/notes/${note.id}`).send({
      title: 'Updated Title'
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(note.id);
    expect(response.body.title).toBe('Updated Title');
    expect(response.body.content).toBe(note.content);
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(note.updatedAt).getTime()
    );
  });

  it('returns 400 when no update fields are provided', async () => {
    const note = listNotes()[0];
    const response = await request(app).put(`/api/notes/${note.id}`).send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'No fields provided' });
  });

  it('deletes a note', async () => {
    const note = listNotes()[0];
    const response = await request(app).delete(`/api/notes/${note.id}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(getNoteById(note.id)).toBeUndefined();
  });

  it('returns 404 when deleting a missing note', async () => {
    const response = await request(app).delete('/api/notes/123e4567-e89b-12d3-a456-426614174000');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Note not found' });
  });
});
