import request from 'supertest';

import app from '../app';

describe('app', () => {
  it('parses json request bodies for mounted routes', async () => {
    const response = await request(app).post('/api/notes').send({ title: 'Hello', content: 'World' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Hello');
    expect(response.body.content).toBe('World');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
  });
});
