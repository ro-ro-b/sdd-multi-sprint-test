import express from 'express';
import categoriesRouter from './routes/categories';
import notesRouter from './routes/notes';

const app = express();

app.use(express.json());
app.use('/api/notes', notesRouter);
app.use('/api/categories', categoriesRouter);

export default app;
