import { TocGenerator } from '../src/toc-generator';
import { HeaderEntry, FormatOptions } from '../src/types';

describe('TocGenerator', () => {
  let tocGenerator: TocGenerator;

  beforeEach(() => {
    tocGenerator = new TocGenerator();
  });

  describe('extractHeaders', () => {
    it('should extract headers from markdown content', () => {
      const markdownContent = `# Main Title
Some content here.

## Section One
Content for section one.

### Subsection A
More content.

## Section Two
Content for section two.`;

      const expectedHeaders: HeaderEntry[] = [
        { level: 1, text: 'Main Title', anchor: 'main-title', lineNumber: 1 },
        { level: 2, text: 'Section One', anchor: 'section-one', lineNumber: 4 },
        { level: 3, text: 'Subsection A', anchor: 'subsection-a', lineNumber: 7 },
        { level: 2, text: 'Section Two', anchor: 'section-two', lineNumber: 10 }
      ];

      const result = tocGenerator.extractHeaders(markdownContent);

      expect(result).toEqual(expectedHeaders);
    });

    it('should handle empty content gracefully', () => {
      const result = tocGenerator.extractHeaders('');
      expect(result).toEqual([]);
    });

    it('should handle content with no headers', () => {
      const markdownContent = 'Just some regular text without any headers.';
      const result = tocGenerator.extractHeaders(markdownContent);
      expect(result).toEqual([]);
    });

    it('should handle duplicate header names with unique anchors', () => {
      const markdownContent = `# Introduction
## Setup
# Introduction`;

      const result = tocGenerator.extractHeaders(markdownContent);

      expect(result).toHaveLength(3);
      expect(result[0].anchor).toBe('introduction');
      expect(result[2].anchor).toBe('introduction-1');
    });
  });

  describe('generateTocMarkdown', () => {
    it('should generate bullet list TOC format', () => {
      const headers: HeaderEntry[] = [
        { level: 1, text: 'Main Title', anchor: 'main-title', lineNumber: 1 },
        { level: 2, text: 'Section One', anchor: 'section-one', lineNumber: 4 },
        { level: 3, text: 'Subsection A', anchor: 'subsection-a', lineNumber: 7 }
      ];

      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        levelRange: { min: 1, max: 6 }
      };

      const expectedToc = `- [Main Title](#main-title)
  - [Section One](#section-one)
    - [Subsection A](#subsection-a)`;

      const result = tocGenerator.generateTocMarkdown(headers, formatOptions);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tocMarkdown).toBe(expectedToc);
        expect(result.headersFound).toBe(3);
      }
    });

    it('should generate numbered list TOC format', () => {
      const headers: HeaderEntry[] = [
        { level: 1, text: 'Introduction', anchor: 'introduction', lineNumber: 1 },
        { level: 2, text: 'Getting Started', anchor: 'getting-started', lineNumber: 4 }
      ];

      const formatOptions: FormatOptions = {
        formatType: 'numbers',
        indentSize: 2,
        includeLinks: true,
        levelRange: { min: 1, max: 6 }
      };

      const expectedToc = `1. [Introduction](#introduction)
  1. [Getting Started](#getting-started)`;

      const result = tocGenerator.generateTocMarkdown(headers, formatOptions);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tocMarkdown).toBe(expectedToc);
      }
    });

    it('should filter headers by level range', () => {
      const headers: HeaderEntry[] = [
        { level: 1, text: 'Title', anchor: 'title', lineNumber: 1 },
        { level: 2, text: 'Section', anchor: 'section', lineNumber: 4 },
        { level: 3, text: 'Subsection', anchor: 'subsection', lineNumber: 7 },
        { level: 4, text: 'Deep Section', anchor: 'deep-section', lineNumber: 10 }
      ];

      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        levelRange: { min: 2, max: 3 }
      };

      const result = tocGenerator.generateTocMarkdown(headers, formatOptions);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.headersFound).toBe(2);
        expect(result.tocMarkdown).toContain('Section');
        expect(result.tocMarkdown).toContain('Subsection');
        expect(result.tocMarkdown).not.toContain('Title');
        expect(result.tocMarkdown).not.toContain('Deep Section');
      }
    });

    it('should return error for empty headers array', () => {
      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        levelRange: { min: 1, max: 6 }
      };

      const result = tocGenerator.generateTocMarkdown([], formatOptions);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('No headers found in the specified range');
      }
    });
  });

  describe('createAnchorLinks', () => {
    it('should create URL-safe anchors from header text', () => {
      const testCases = [
        { input: 'Simple Header', expected: 'simple-header' },
        { input: 'Header with Numbers 123', expected: 'header-with-numbers-123' },
        { input: 'Special!@#$%^&*()Characters', expected: 'specialcharacters' },
        { input: 'Spaces   and    tabs', expected: 'spaces-and-tabs' },
        { input: 'UPPERCASE and lowercase', expected: 'uppercase-and-lowercase' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = tocGenerator.createAnchorLink(input);
        expect(result).toBe(expected);
      });
    });
  });
});