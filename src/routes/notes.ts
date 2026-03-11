import { Router } from 'express';
import {
  createNote,
  deleteNote,
  getNoteById,
  listNotes,
  updateNote,
  updateNoteCategory,
} from '../data/notesStore';
import {
  isValidCategory,
  isValidUuid,
  validateCreateNoteInput,
  validateUpdateCategoryInput,
  validateUpdateNoteInput,
} from '../utils/validation';

const router = Router();

router.get('/', (req, res) => {
  const { category } = req.query;

  if (typeof category === 'string') {
    if (!isValidCategory(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    return res.status(200).json(listNotes(category));
  }

  return res.status(200).json(listNotes());
});

router.patch('/:id/category', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (!validateUpdateCategoryInput(req.body)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const note = updateNoteCategory(id, req.body.category);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.status(200).json(note);
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
  if (!validateCreateNoteInput(req.body)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const note = createNote(req.body);
  return res.status(201).json(note);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const validation = validateUpdateNoteInput(req.body);

  if (!validation.hasFields) {
    return res.status(400).json({ error: 'No fields provided' });
  }

  if (!validation.valid) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const note = updateNote(id, req.body);

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
