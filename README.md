# sdd-multi-sprint-test

A simple in-memory Notes REST API built with Express and TypeScript.

## Setup

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` if needed:

```bash
PORT=3000
```

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
```

## API

- `GET /api/notes` - list all notes, newest first
- `GET /api/notes/:id` - get a note by id
- `POST /api/notes` - create a note
- `PUT /api/notes/:id` - update a note
- `DELETE /api/notes/:id` - delete a note

## Notes

- Storage is in-memory only.
- Seeded with the provided fixture notes.
- Validation returns `400` for invalid create requests and empty update requests.
- Missing notes return `404`.
