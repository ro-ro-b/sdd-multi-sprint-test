import { validate as validateUuid } from 'uuid';
import { categories, CreateNoteInput, UpdateCategoryInput, UpdateNoteInput } from '../types';

const TITLE_MAX_LENGTH = 200;
const CONTENT_MAX_LENGTH = 5000;
const CATEGORY_MAX_LENGTH = 50;

export const isValidUuid = (value: string): boolean => validateUuid(value);

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isValidCategory = (value: string): value is (typeof categories)[number] => {
  return value.length <= CATEGORY_MAX_LENGTH && categories.includes(value as (typeof categories)[number]);
};

export const validateCreateNoteInput = (value: unknown): value is CreateNoteInput => {
  if (!isObject(value)) {
    return false;
  }

  const { title, content, category } = value;

  if (typeof title !== 'string' || typeof content !== 'string') {
    return false;
  }

  if (title.length === 0 || content.length === 0) {
    return false;
  }

  if (title.length > TITLE_MAX_LENGTH || content.length > CONTENT_MAX_LENGTH) {
    return false;
  }

  if (category !== undefined && (typeof category !== 'string' || !isValidCategory(category))) {
    return false;
  }

  return true;
};

export const validateUpdateNoteInput = (
  value: unknown,
): { valid: boolean; hasFields: boolean } => {
  if (!isObject(value)) {
    return { valid: false, hasFields: false };
  }

  const allowedKeys: Array<keyof UpdateNoteInput> = ['title', 'content'];
  const keys = Object.keys(value);
  const providedKeys = keys.filter((key) => allowedKeys.includes(key as keyof UpdateNoteInput));

  if (providedKeys.length === 0) {
    return { valid: false, hasFields: false };
  }

  for (const key of keys) {
    if (!allowedKeys.includes(key as keyof UpdateNoteInput)) {
      return { valid: false, hasFields: true };
    }
  }

  if ('title' in value) {
    const title = value.title;
    if (typeof title !== 'string' || title.length === 0 || title.length > TITLE_MAX_LENGTH) {
      return { valid: false, hasFields: true };
    }
  }

  if ('content' in value) {
    const content = value.content;
    if (typeof content !== 'string' || content.length === 0 || content.length > CONTENT_MAX_LENGTH) {
      return { valid: false, hasFields: true };
    }
  }

  return { valid: true, hasFields: true };
};

export const validateUpdateCategoryInput = (value: unknown): value is UpdateCategoryInput => {
  if (!isObject(value)) {
    return false;
  }

  const keys = Object.keys(value);

  if (keys.length !== 1 || !('category' in value)) {
    return false;
  }

  return typeof value.category === 'string' && isValidCategory(value.category);
};
