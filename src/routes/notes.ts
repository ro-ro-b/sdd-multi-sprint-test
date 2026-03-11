import { Router } from 'express';
import {
  createNote,
  deleteNote,
  getNoteById,
  listNotes,
  updateNote
} from '../data/notesStore';
import {
  isValidUuid,
  validateCreateNoteInput,
  validateUpdateNoteInput
} from '../utils/validation';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json(listNotes());
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const note = getNoteById(id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.status(200).json(note);
});

router.post('/', (req, res) => {
  const validation = validateCreateNoteInput(req.body);

  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error ?? 'Missing or invalid fields' });
  }

  const note = createNote(validation.data);
  return res.status(201).json(note);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const validation = validateUpdateNoteInput(req.body);

  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error ?? 'No fields provided' });
  }

  const note = updateNote(id, validation.data);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.status(200).json(note);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const deleted = deleteNote(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.status(204).send();
});

export default router;
