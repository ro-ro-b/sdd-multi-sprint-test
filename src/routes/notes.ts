import { Router } from 'express';

import { notesStore } from '../data/notesStore';
import { isValidUuid, validateCreateNoteInput, validateUpdateNoteInput } from '../lib/validation';
import type { ErrorResponse } from '../types/note';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json(notesStore.list());
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    const response: ErrorResponse = { error: 'Note not found' };
    return res.status(404).json(response);
  }

  const note = notesStore.getById(id);

  if (!note) {
    const response: ErrorResponse = { error: 'Note not found' };
    return res.status(404).json(response);
  }

  return res.status(200).json(note);
});

router.post('/', (req, res) => {
  const validation = validateCreateNoteInput(req.body);

  if (!validation.success) {
    const response: ErrorResponse = { error: validation.error };
    return res.status(400).json(response);
  }

  const note = notesStore.create(validation.data);
  return res.status(201).json(note);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    const response: ErrorResponse = { error: 'Note not found' };
    return res.status(404).json(response);
  }

  const validation = validateUpdateNoteInput(req.body);

  if (!validation.success) {
    const response: ErrorResponse = { error: validation.error };
    return res.status(400).json(response);
  }

  const note = notesStore.update(id, validation.data);

  if (!note) {
    const response: ErrorResponse = { error: 'Note not found' };
    return res.status(404).json(response);
  }

  return res.status(200).json(note);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    const response: ErrorResponse = { error: 'Note not found' };
    return res.status(404).json(response);
  }

  const deleted = notesStore.delete(id);

  if (!deleted) {
    const response: ErrorResponse = { error: 'Note not found' };
    return res.status(404).json(response);
  }

  return res.status(204).send();
});

export default router;
