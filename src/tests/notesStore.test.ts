import { notesStore } from '../data/notesStore';

describe('notesStore', () => {
  beforeEach(() => {
    notesStore.reset();
    vi.useRealTimers();
  });

  it('starts empty and reset clears all notes', () => {
    expect(notesStore.list()).toEqual([]);

    notesStore.create({ title: 'A', content: 'B' });
    expect(notesStore.list()).toHaveLength(1);

    notesStore.reset();
    expect(notesStore.list()).toEqual([]);
  });

  it('creates a note with id and matching timestamps', () => {
    const note = notesStore.create({ title: 'Title', content: 'Content' });

    expect(note.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(note.title).toBe('Title');
    expect(note.content).toBe('Content');
    expect(note.createdAt).toBeTypeOf('string');
    expect(note.updatedAt).toBeTypeOf('string');
    expect(note.createdAt).toBe(note.updatedAt);
  });

  it('returns clones from create/getById/list so callers cannot mutate store state', () => {
    const created = notesStore.create({ title: 'Original', content: 'Body' });
    created.title = 'Mutated outside';

    const fetched = notesStore.getById(created.id);
    expect(fetched?.title).toBe('Original');

    const list = notesStore.list();
    list[0].content = 'Changed';

    const fetchedAgain = notesStore.getById(created.id);
    expect(fetchedAgain?.content).toBe('Body');
  });

  it('gets a note by id and returns undefined for unknown ids', () => {
    const created = notesStore.create({ title: 'Title', content: 'Content' });

    expect(notesStore.getById(created.id)).toEqual(created);
    expect(notesStore.getById('missing')).toBeUndefined();
  });

  it('lists notes newest first by createdAt', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const first = notesStore.create({ title: 'First', content: '1' });

    vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
    const second = notesStore.create({ title: 'Second', content: '2' });

    vi.setSystemTime(new Date('2024-01-01T00:00:02.000Z'));
    const third = notesStore.create({ title: 'Third', content: '3' });

    expect(notesStore.list().map((note) => note.id)).toEqual([third.id, second.id, first.id]);
  });

  it('updates only provided fields and refreshes updatedAt', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const created = notesStore.create({ title: 'Title', content: 'Content' });

    vi.setSystemTime(new Date('2024-01-01T00:00:05.000Z'));
    const updated = notesStore.update(created.id, { title: 'Updated title' });

    expect(updated).toEqual({
      ...created,
      title: 'Updated title',
      updatedAt: '2024-01-01T00:00:05.000Z'
    });
    expect(updated?.content).toBe('Content');
    expect(updated?.createdAt).toBe(created.createdAt);
  });

  it('returns undefined when updating a missing note', () => {
    expect(notesStore.update('missing', { title: 'Updated' })).toBeUndefined();
  });

  it('deletes existing notes and returns false for missing notes', () => {
    const created = notesStore.create({ title: 'Title', content: 'Content' });

    expect(notesStore.delete(created.id)).toBe(true);
    expect(notesStore.getById(created.id)).toBeUndefined();
    expect(notesStore.delete(created.id)).toBe(false);
  });
});
