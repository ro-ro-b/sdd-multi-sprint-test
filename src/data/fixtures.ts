import { CreateNoteInput } from '../types';

export const noteFixtures: CreateNoteInput[] = [
  { title: 'First Note', content: 'Hello world', category: 'personal' },
  {
    title: 'Meeting Notes',
    content: 'Discussed timeline',
    category: 'work',
  },
  { title: 'App Idea', content: 'Build a notes API', category: 'ideas' },
];
