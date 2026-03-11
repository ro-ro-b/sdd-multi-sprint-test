import type { CreateNoteInput, UpdateNoteInput } from '../types/note';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function validateCreateNoteInput(value: unknown): {
  valid: boolean;
  data?: CreateNoteInput;
  error?: string;
} {
  if (!isObject(value)) {
    return { valid: false, error: 'Missing or invalid fields' };
  }

  const { title, content } = value;

  if (
    typeof title !== 'string' ||
    typeof content !== 'string' ||
    title.length === 0 ||
    content.length === 0 ||
    title.length > 200 ||
    content.length > 5000
  ) {
    return { valid: false, error: 'Missing or invalid fields' };
  }

  return {
    valid: true,
    data: { title, content }
  };
}

export function validateUpdateNoteInput(value: unknown): {
  valid: boolean;
  data?: UpdateNoteInput;
  error?: string;
} {
  if (!isObject(value)) {
    return { valid: false, error: 'No fields provided' };
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(value, 'title');
  const hasContent = Object.prototype.hasOwnProperty.call(value, 'content');

  if (!hasTitle && !hasContent) {
    return { valid: false, error: 'No fields provided' };
  }

  const data: UpdateNoteInput = {};

  if (hasTitle) {
    if (typeof value.title !== 'string' || value.title.length > 200) {
      return { valid: false, error: 'No fields provided' };
    }

    data.title = value.title;
  }

  if (hasContent) {
    if (typeof value.content !== 'string' || value.content.length > 5000) {
      return { valid: false, error: 'No fields provided' };
    }

    data.content = value.content;
  }

  return { valid: true, data };
}
