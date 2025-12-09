import { describe, it, expect } from 'vitest';
import { getSCTemplate } from '../data/sc-templates';

describe('getSCTemplate', () => {
  it('returns default template for Supports status', () => {
    const text = getSCTemplate('non-existent-id', 'Supports');
    expect(text).toBe('The content fully meets the requirements of this success criterion.');
  });

  it('returns specific template for Non-text Content (Supports)', () => {
    const text = getSCTemplate('non-text-content', 'Supports');
    expect(text).toBe(
      'All non-text content, such as images and icons, has appropriate alternative text that serves the equivalent purpose.'
    );
  });

  it('appends future work statement for Partially Supports', () => {
    const text = getSCTemplate('non-text-content', 'Partially Supports');
    expect(text).toContain(
      'Most non-text content has alternative text, but some decorative images are missing null alt attributes or some complex images lack detailed descriptions.'
    );
    expect(text).toContain('Work is underway to meet this criteria in the future.');
  });

  it('appends future work statement for Does Not Support', () => {
    const text = getSCTemplate('keyboard', 'Does Not Support');
    expect(text).toContain('Major functionality cannot be accessed or operated using a keyboard.');
    expect(text).toContain('Work is underway to meet this criteria in the future.');
  });

  it('does not append future work statement for Not Applicable', () => {
    const text = getSCTemplate('keyboard', 'Not Applicable');
    expect(text).not.toContain('Work is underway');
    expect(text).toBe('The content does not require user input or interaction.');
  });

  it('returns empty string for Not Tested', () => {
    const text = getSCTemplate('keyboard', 'Not Tested');
    expect(text).toBe('');
  });
});
