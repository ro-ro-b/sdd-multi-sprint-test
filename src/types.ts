export const categories = ['personal', 'work', 'ideas', 'archive'] as const;

export type Category = (typeof categories)[number];

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  category?: Category;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

export interface UpdateCategoryInput {
  category: Category;
}

export interface CategoryCount {
  name: Category;
  count: number;
}
