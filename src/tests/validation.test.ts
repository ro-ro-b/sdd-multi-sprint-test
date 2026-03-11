import { describe, expect, it } from 'vitest';
import {
  isObject,
  isValidCategory,
  isValidUuid,
  validateCreateNoteInput,
  validateUpdateCategoryInput,
  validateUpdateNoteInput,
} from '../utils/validation';
import { categories } from '../types';

describe('validation utils', () => {
  describe('isValidUuid', () => {
    it('returns true for a valid uuid', async () => {
      const { v4: uuidv4 } = await import('uuid');
      expect(isValidUuid(uuidv4())).toBe(true);
    });

    it('returns false for an invalid uuid', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('')).toBe(false);
    });
  });

  describe('isObject', () => {
    it('returns true for plain objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('returns false for null, arrays, and primitives', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('test')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject(true)).toBe(false);
    });
  });

  describe('isValidCategory', () => {
    it('returns true for all supported categories', () => {
      for (const category of categories) {
        expect(isValidCategory(category)).toBe(true);
      }
    });

    it('returns false for unsupported categories', () => {
      expect(isValidCategory('invalid')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory('PERSONAL')).toBe(false);
      expect(isValidCategory(' personal ')).toBe(false);
    });

    it('returns false for values longer than the category max length', () => {
      expect(isValidCategory('a'.repeat(51))).toBe(false);
    });
  });

  describe('validateCreateNoteInput', () => {
    it('accepts valid input with required fields only', () => {
      expect(
        validateCreateNoteInput({
          title: 'Title',
          content: 'Content',
        }),
      ).toBe(true);
    });

    it('accepts valid input with category', () => {
      expect(
        validateCreateNoteInput({
          title: 'Title',
          content: 'Content',
          category: 'work',
        }),
      ).toBe(true);
    });

    it('rejects non-object values', () => {
      expect(validateCreateNoteInput(null)).toBe(false);
      expect(validateCreateNoteInput([])).toBe(false);
      expect(validateCreateNoteInput('test')).toBe(false);
    });

    it('rejects missing required fields', () => {
      expect(validateCreateNoteInput({ title: 'Only title' })).toBe(false);
      expect(validateCreateNoteInput({ content: 'Only content' })).toBe(false);
      expect(validateCreateNoteInput({})).toBe(false);
    });

    it('rejects non-string title or content', () => {
      expect(validateCreateNoteInput({ title: 1, content: 'Content' })).toBe(false);
      expect(validateCreateNoteInput({ title: 'Title', content: 1 })).toBe(false);
    });

    it('rejects empty title or content', () => {
      expect(validateCreateNoteInput({ title: '', content: 'Content' })).toBe(false);
      expect(validateCreateNoteInput({ title: 'Title', content: '' })).toBe(false);
    });

    it('rejects title longer than 200 characters', () => {
      expect(
        validateCreateNoteInput({
          title: 'a'.repeat(201),
          content: 'Content',
        }),
      ).toBe(false);
    });

    it('rejects content longer than 5000 characters', () => {
      expect(
        validateCreateNoteInput({
          title: 'Title',
          content: 'a'.repeat(5001),
        }),
      ).toBe(false);
    });

    it('rejects invalid category values', () => {
      expect(
        validateCreateNoteInput({
          title: 'Title',
          content: 'Content',
          category: 'invalid',
        }),
      ).toBe(false);

      expect(
        validateCreateNoteInput({
          title: 'Title',
          content: 'Content',
          category: 123,
        }),
      ).toBe(false);
    });
  });

  describe('validateUpdateNoteInput', () => {
    it('accepts updating title only', () => {
      expect(validateUpdateNoteInput({ title: 'Updated' })).toEqual({
        valid: true,
        hasFields: true,
      });
    });

    it('accepts updating content only', () => {
      expect(validateUpdateNoteInput({ content: 'Updated content' })).toEqual({
        valid: true,
        hasFields: true,
      });
    });

    it('accepts updating both title and content', () => {
      expect(
        validateUpdateNoteInput({ title: 'Updated', content: 'Updated content' }),
      ).toEqual({ valid: true, hasFields: true });
    });

    it('returns hasFields false for non-object values', () => {
      expect(validateUpdateNoteInput(null)).toEqual({ valid: false, hasFields: false });
      expect(validateUpdateNoteInput([])).toEqual({ valid: false, hasFields: false });
      expect(validateUpdateNoteInput('test')).toEqual({ valid: false, hasFields: false });
    });

    it('returns hasFields false when no allowed fields are provided', () => {
      expect(validateUpdateNoteInput({})).toEqual({ valid: false, hasFields: false });
      expect(validateUpdateNoteInput({ category: 'work' })).toEqual({
        valid: false,
        hasFields: false,
      });
    });

    it('rejects unknown fields when allowed fields are also present', () => {
      expect(
        validateUpdateNoteInput({ title: 'Updated', extra: 'nope' }),
      ).toEqual({ valid: false, hasFields: true });
    });

    it('rejects invalid title values', () => {
      expect(validateUpdateNoteInput({ title: '' })).toEqual({ valid: false, hasFields: true });
      expect(validateUpdateNoteInput({ title: 123 })).toEqual({ valid: false, hasFields: true });
      expect(validateUpdateNoteInput({ title: 'a'.repeat(201) })).toEqual({
        valid: false,
        hasFields: true,
      });
    });

    it('rejects invalid content values', () => {
      expect(validateUpdateNoteInput({ content: '' })).toEqual({ valid: false, hasFields: true });
      expect(validateUpdateNoteInput({ content: 123 })).toEqual({ valid: false, hasFields: true });
      expect(validateUpdateNoteInput({ content: 'a'.repeat(5001) })).toEqual({
        valid: false,
        hasFields: true,
      });
    });
  });

  describe('validateUpdateCategoryInput', () => {
    it('accepts a valid category payload', () => {
      expect(validateUpdateCategoryInput({ category: 'archive' })).toBe(true);
    });

    it('rejects non-object values', () => {
      expect(validateUpdateCategoryInput(null)).toBe(false);
      expect(validateUpdateCategoryInput([])).toBe(false);
      expect(validateUpdateCategoryInput('work')).toBe(false);
    });

    it('rejects missing category', () => {
      expect(validateUpdateCategoryInput({})).toBe(false);
    });

    it('rejects invalid category values', () => {
      expect(validateUpdateCategoryInput({ category: 'invalid' })).toBe(false);
      expect(validateUpdateCategoryInput({ category: 123 })).toBe(false);
      expect(validateUpdateCategoryInput({ category: '' })).toBe(false);
    });
  });
});
