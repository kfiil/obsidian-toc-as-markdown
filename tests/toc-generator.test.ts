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
    it('should generate bullet list TOC format with Obsidian internal links', () => {
      const headers: HeaderEntry[] = [
        { level: 1, text: 'Main Title', anchor: 'main-title', lineNumber: 1 },
        { level: 2, text: 'Section One', anchor: 'section-one', lineNumber: 4 },
        { level: 3, text: 'Subsection A', anchor: 'subsection-a', lineNumber: 7 }
      ];

      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        linkFormat: 'obsidian',
        levelRange: { min: 1, max: 6 }
      };

      const expectedToc = `- [[#Main Title]]
  - [[#Section One]]
    - [[#Subsection A]]`;

      const result = tocGenerator.generateTocMarkdown(headers, formatOptions);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tocMarkdown).toBe(expectedToc);
        expect(result.headersFound).toBe(3);
      }
    });

    it('should preserve exact header text in Obsidian links', () => {
      const headers: HeaderEntry[] = [
        { level: 1, text: 'What do we mean when we say TRANSPARENCY', anchor: 'what-do-we-mean-when-we-say-transparency', lineNumber: 1 },
        { level: 2, text: 'API/REST Endpoints', anchor: 'apirest-endpoints', lineNumber: 4 },
        { level: 3, text: 'File.txt Processing', anchor: 'filetxt-processing', lineNumber: 7 }
      ];

      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        linkFormat: 'obsidian',
        levelRange: { min: 1, max: 6 }
      };

      const expectedToc = `- [[#What do we mean when we say TRANSPARENCY]]
  - [[#API/REST Endpoints]]
    - [[#File.txt Processing]]`;

      const result = tocGenerator.generateTocMarkdown(headers, formatOptions);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tocMarkdown).toBe(expectedToc);
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
        linkFormat: 'obsidian',
        levelRange: { min: 1, max: 6 }
      };

      const expectedToc = `1. [[#Introduction]]
  1. [[#Getting Started]]`;

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
        linkFormat: 'obsidian',
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

    it('should generate markdown links when linkFormat is markdown', () => {
      const headers: HeaderEntry[] = [
        { level: 1, text: 'What do we mean when we say TRANSPARENCY', anchor: 'what-do-we-mean-when-we-say-transparency', lineNumber: 1 },
        { level: 2, text: 'API/REST Endpoints', anchor: 'apirest-endpoints', lineNumber: 4 }
      ];

      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        linkFormat: 'markdown',
        levelRange: { min: 1, max: 6 }
      };

      const expectedToc = `- [What do we mean when we say TRANSPARENCY](#what-do-we-mean-when-we-say-transparency)
  - [API/REST Endpoints](#apirest-endpoints)`;

      const result = tocGenerator.generateTocMarkdown(headers, formatOptions);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tocMarkdown).toBe(expectedToc);
      }
    });

    it('should return error for empty headers array', () => {
      const formatOptions: FormatOptions = {
        formatType: 'bullets',
        indentSize: 2,
        includeLinks: true,
        linkFormat: 'obsidian',
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

    it('should handle uppercase headers correctly', () => {
      const testCases = [
        { input: 'What do we mean when we say TRANSPARENCY', expected: 'what-do-we-mean-when-we-say-transparency' },
        { input: 'ALL CAPS HEADER', expected: 'all-caps-header' },
        { input: 'Mixed CASE Header', expected: 'mixed-case-header' },
        { input: 'HTML & CSS Basics', expected: 'html-css-basics' },
        { input: 'API/REST Endpoints', expected: 'apirest-endpoints' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = tocGenerator.createAnchorLink(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle special characters and punctuation', () => {
      const testCases = [
        { input: 'What\'s New?', expected: 'whats-new' },
        { input: 'Step 1: Setup', expected: 'step-1-setup' },
        { input: 'Q&A Section', expected: 'qa-section' },
        { input: 'Before/After Comparison', expected: 'beforeafter-comparison' },
        { input: 'File.txt Processing', expected: 'filetxt-processing' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = tocGenerator.createAnchorLink(input);
        expect(result).toBe(expected);
      });
    });
  });
});