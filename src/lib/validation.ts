import type { CreateNoteInput, UpdateNoteInput } from '../types/note';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  error: string;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isValidUuid = (value: string): boolean => {
  return UUID_V4_REGEX.test(value);
};

export const validateCreateNoteInput = (value: unknown): ValidationResult<CreateNoteInput> => {
  if (!isObject(value)) {
    return { success: false, error: 'Missing or invalid fields' };
  }

  const { title, content } = value;

  if (typeof title !== 'string' || typeof content !== 'string') {
    return { success: false, error: 'Missing or invalid fields' };
  }

  if (title.length === 0 || title.length > MAX_TITLE_LENGTH) {
    return { success: false, error: 'Missing or invalid fields' };
  }

  if (content.length === 0 || content.length > MAX_CONTENT_LENGTH) {
    return { success: false, error: 'Missing or invalid fields' };
  }

  return {
    success: true,
    data: {
      title,
      content
    }
  };
};

export const validateUpdateNoteInput = (value: unknown): ValidationResult<UpdateNoteInput> => {
  if (!isObject(value)) {
    return { success: false, error: 'No fields provided' };
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(value, 'title');
  const hasContent = Object.prototype.hasOwnProperty.call(value, 'content');

  if (!hasTitle && !hasContent) {
    return { success: false, error: 'No fields provided' };
  }

  const data: UpdateNoteInput = {};

  if (hasTitle) {
    if (typeof value.title !== 'string' || value.title.length === 0 || value.title.length > MAX_TITLE_LENGTH) {
      return { success: false, error: 'Invalid fields' };
    }

    data.title = value.title;
  }

  if (hasContent) {
    if (typeof value.content !== 'string' || value.content.length === 0 || value.content.length > MAX_CONTENT_LENGTH) {
      return { success: false, error: 'Invalid fields' };
    }

    data.content = value.content;
  }

  return {
    success: true,
    data
  };
};
