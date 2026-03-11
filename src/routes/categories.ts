import { Router } from 'express';
import { getCategoryCounts } from '../data/notesStore';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json(getCategoryCounts());
});

export default router;
