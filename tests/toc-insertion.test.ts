import { TocAsMarkdownPlugin } from '../src/main';

// Mock Obsidian classes
jest.mock('obsidian');

describe('TOC Insertion Logic', () => {
  let plugin: TocAsMarkdownPlugin;
  let mockApp: any;

  beforeEach(async () => {
    mockApp = {
      workspace: {
        on: jest.fn(),
        off: jest.fn(),
        getActiveFile: jest.fn()
      },
      vault: {
        read: jest.fn(),
        modify: jest.fn()
      }
    };

    const mockManifest = {
      id: 'obsidian-toc-as-markdown',
      name: 'TOC as Markdown',
      version: '1.0.0',
      author: 'Test Author',
      minAppVersion: '0.15.0',
      description: 'Test plugin'
    };

    plugin = new TocAsMarkdownPlugin(mockApp, mockManifest);
    await plugin.onload();
  });

  describe('insertTocIntoContent', () => {
    it('should insert TOC at the very beginning for documents without title', () => {
      const content = `This is some content.

## First Header
Some content here.

### Subheader
More content.`;

      const tocMarkdown = `- [[#First Header]]
  - [[#Subheader]]`;

      const expectedResult = `## Table of Contents
- [[#First Header]]
  - [[#Subheader]]

This is some content.

## First Header
Some content here.

### Subheader
More content.`;

      const result = (plugin as any).insertTocIntoContent(content, tocMarkdown);
      expect(result).toBe(expectedResult);
    });

    it('should insert TOC after title and before content', () => {
      const content = `# Document Title

This is the introduction paragraph.

## First Section
Content for first section.

## Second Section
Content for second section.`;

      const tocMarkdown = `- [[#First Section]]
- [[#Second Section]]`;

      const expectedResult = `# Document Title

## Table of Contents
- [[#First Section]]
- [[#Second Section]]

This is the introduction paragraph.

## First Section
Content for first section.

## Second Section
Content for second section.`;

      const result = (plugin as any).insertTocIntoContent(content, tocMarkdown);
      expect(result).toBe(expectedResult);
    });

    it('should insert TOC immediately after title with no content in between', () => {
      const content = `# My Document

## Section One
Content here.

## Section Two
More content.`;

      const tocMarkdown = `- [[#Section One]]
- [[#Section Two]]`;

      const expectedResult = `# My Document

## Table of Contents
- [[#Section One]]
- [[#Section Two]]

## Section One
Content here.

## Section Two
More content.`;

      const result = (plugin as any).insertTocIntoContent(content, tocMarkdown);
      expect(result).toBe(expectedResult);
    });

    it('should handle frontmatter correctly', () => {
      const content = `---
title: My Document
tags: [example]
---

# Document Title

Some introduction text.

## First Header
Content here.`;

      const tocMarkdown = `- [[#First Header]]`;

      const expectedResult = `---
title: My Document
tags: [example]
---

# Document Title

## Table of Contents
- [[#First Header]]

Some introduction text.

## First Header
Content here.`;

      const result = (plugin as any).insertTocIntoContent(content, tocMarkdown);
      expect(result).toBe(expectedResult);
    });
  });
});