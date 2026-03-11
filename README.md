# sdd-multi-sprint-test

A simple in-memory Notes REST API built with Express 4 and TypeScript.

## Requirements

- Node.js 20+

## Setup

```bash
npm install
```

## Environment

Copy the example environment file if needed:

```bash
cp .env.example .env
```

Available environment variables:

- `PORT` — server port, example: `3000`

## Scripts

- `npm run dev` — start the development server with watch mode
- `npm run build` — compile TypeScript to `dist`
- `npm start` — run the compiled server
- `npm test` — run the Vitest test suite

## Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## API

### `GET /api/notes`
List all notes, newest first, with optional category filtering.

Optional query params:
- `category` — one of `personal`, `work`, `ideas`, `archive`

Response: `200 OK`

### `GET /api/notes/:id`
Get a single note by ID.

Response: `200 OK`

Error:
- `404 {"error":"Note not found"}`

### `POST /api/notes`
Create a new note.

Request body:

```json
{
  "title": "My note",
  "content": "Some content"
}
```

Response: `201 Created`

Errors:
- `400 {"error":"Missing or invalid fields"}`

### `PUT /api/notes/:id`
Update an existing note.

Request body:

```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

Response: `200 OK`

Errors:
- `400 {"error":"No fields provided"}`
- `400 {"error":"Missing or invalid fields"}`
- `404 {"error":"Note not found"}`

### `PATCH /api/notes/:id/category`
Update only a note category.

Request body:

```json
{
  "category": "work"
}
```

Response: `200 OK`

Errors:
- `400 {"error":"Invalid category"}`
- `404 {"error":"Note not found"}`

### `DELETE /api/notes/:id`
Delete a note.

Response: `204 No Content`

Error:
- `404 {"error":"Note not found"}`

### `GET /api/categories`
List available categories with note counts.

Response: `200 OK`

Example response:

```json
[
  { "name": "personal", "count": 1 },
  { "name": "work", "count": 1 },
  { "name": "ideas", "count": 1 },
  { "name": "archive", "count": 0 }
]
```

## Notes

- Notes are stored in memory only.
- Notes are returned newest first using `createdAt` descending.
- `id` values are UUIDs.
- `createdAt` and `updatedAt` are generated automatically.
- `updatedAt` changes on successful updates, including category-only updates.
- Valid categories are `personal`, `work`, `ideas`, and `archive`.
- Invalid route parameter UUIDs are treated as not found.
- `DELETE` returns `204` with an empty body.

## Test Fixtures

The integration tests seed these notes:

- `First Note` — `Hello world` — `personal`
- `Meeting Notes` — `Discussed timeline` — `work`
- `App Idea` — `Build a notes API` — `ideas`
