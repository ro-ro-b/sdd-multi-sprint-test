# sdd-multi-sprint-test

A basic Notes REST API built with Express 4, TypeScript 5, and Vitest.

## Requirements

- Node.js 20+

## Setup

```bash
npm install
```

## Environment Variables

Copy the example file if needed:

```bash
cp .env.example .env
```

Available variables:

- `PORT` - Server port (default: `3000`)

## Development

Run the API in watch mode:

```bash
npm run dev
```

## Build

Compile TypeScript to `dist/`:

```bash
npm run build
```

## Start

Run the compiled server:

```bash
npm start
```

## Test

Run the Vitest suite:

```bash
npm test
```

## API Endpoints

- `GET /api/notes` - List all notes, newest first
- `GET /api/notes/:id` - Get a single note by ID
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Delete a note

## Notes

- Storage is in-memory only and resets when the process restarts.
- Tests use the exported Express app with Supertest, so no real port binding is required.
- The in-memory store is reset before each test for isolation.
