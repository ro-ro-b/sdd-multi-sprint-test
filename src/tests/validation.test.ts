import {
  isValidUuid,
  validateCreateNoteInput,
  validateUpdateNoteInput
} from '../lib/validation';

describe('validation helpers', () => {
  describe('isValidUuid', () => {
    it('returns true for a valid v4 uuid', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('returns true for uppercase valid v4 uuid', () => {
      expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('returns false for a non-v4 uuid', () => {
      expect(isValidUuid('550e8400-e29b-11d4-a716-446655440000')).toBe(false);
    });

    it('returns false for malformed values', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('')).toBe(false);
    });
  });

  describe('validateCreateNoteInput', () => {
    it('accepts a valid payload', () => {
      const result = validateCreateNoteInput({ title: 'Title', content: 'Content' });

      expect(result).toEqual({
        success: true,
        data: { title: 'Title', content: 'Content' }
      });
    });

    it('rejects non-object payloads', () => {
      expect(validateCreateNoteInput(null)).toEqual({ success: false, error: 'Missing or invalid fields' });
      expect(validateCreateNoteInput(undefined)).toEqual({ success: false, error: 'Missing or invalid fields' });
      expect(validateCreateNoteInput('x')).toEqual({ success: false, error: 'Missing or invalid fields' });
      expect(validateCreateNoteInput([])).toEqual({ success: false, error: 'Missing or invalid fields' });
    });

    it('rejects missing fields', () => {
      expect(validateCreateNoteInput({ title: 'Only title' })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
      expect(validateCreateNoteInput({ content: 'Only content' })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
    });

    it('rejects non-string fields', () => {
      expect(validateCreateNoteInput({ title: 123, content: 'Content' })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
      expect(validateCreateNoteInput({ title: 'Title', content: 123 })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
    });

    it('rejects empty strings', () => {
      expect(validateCreateNoteInput({ title: '', content: 'Content' })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
      expect(validateCreateNoteInput({ title: 'Title', content: '' })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
    });

    it('accepts boundary lengths and rejects values beyond max lengths', () => {
      const maxTitle = 't'.repeat(200);
      const maxContent = 'c'.repeat(5000);

      expect(validateCreateNoteInput({ title: maxTitle, content: maxContent })).toEqual({
        success: true,
        data: { title: maxTitle, content: maxContent }
      });

      expect(validateCreateNoteInput({ title: 't'.repeat(201), content: 'Content' })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
      expect(validateCreateNoteInput({ title: 'Title', content: 'c'.repeat(5001) })).toEqual({
        success: false,
        error: 'Missing or invalid fields'
      });
    });
  });

  describe('validateUpdateNoteInput', () => {
    it('accepts title-only updates', () => {
      expect(validateUpdateNoteInput({ title: 'Updated' })).toEqual({
        success: true,
        data: { title: 'Updated' }
      });
    });

    it('accepts content-only updates', () => {
      expect(validateUpdateNoteInput({ content: 'Updated content' })).toEqual({
        success: true,
        data: { content: 'Updated content' }
      });
    });

    it('accepts updates with both fields', () => {
      expect(validateUpdateNoteInput({ title: 'Updated', content: 'Updated content' })).toEqual({
        success: true,
        data: { title: 'Updated', content: 'Updated content' }
      });
    });

    it('ignores unrelated fields when at least one valid field is present', () => {
      expect(validateUpdateNoteInput({ title: 'Updated', ignored: true })).toEqual({
        success: true,
        data: { title: 'Updated' }
      });
    });

    it('rejects non-object payloads', () => {
      expect(validateUpdateNoteInput(null)).toEqual({ success: false, error: 'No fields provided' });
      expect(validateUpdateNoteInput(undefined)).toEqual({ success: false, error: 'No fields provided' });
      expect(validateUpdateNoteInput('x')).toEqual({ success: false, error: 'No fields provided' });
      expect(validateUpdateNoteInput([])).toEqual({ success: false, error: 'No fields provided' });
    });

    it('rejects empty objects and objects without title/content keys', () => {
      expect(validateUpdateNoteInput({})).toEqual({ success: false, error: 'No fields provided' });
      expect(validateUpdateNoteInput({ other: 'value' })).toEqual({ success: false, error: 'No fields provided' });
    });

    it('rejects invalid title values', () => {
      expect(validateUpdateNoteInput({ title: '' })).toEqual({ success: false, error: 'Invalid fields' });
      expect(validateUpdateNoteInput({ title: 123 })).toEqual({ success: false, error: 'Invalid fields' });
      expect(validateUpdateNoteInput({ title: 't'.repeat(201) })).toEqual({
        success: false,
        error: 'Invalid fields'
      });
    });

    it('rejects invalid content values', () => {
      expect(validateUpdateNoteInput({ content: '' })).toEqual({ success: false, error: 'Invalid fields' });
      expect(validateUpdateNoteInput({ content: 123 })).toEqual({ success: false, error: 'Invalid fields' });
      expect(validateUpdateNoteInput({ content: 'c'.repeat(5001) })).toEqual({
        success: false,
        error: 'Invalid fields'
      });
    });

    it('accepts boundary lengths', () => {
      expect(validateUpdateNoteInput({ title: 't'.repeat(200) })).toEqual({
        success: true,
        data: { title: 't'.repeat(200) }
      });
      expect(validateUpdateNoteInput({ content: 'c'.repeat(5000) })).toEqual({
        success: true,
        data: { content: 'c'.repeat(5000) }
      });
    });
  });
});
