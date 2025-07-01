import { TocAsMarkdownPlugin } from '../src/main';
import { TFile, TFolder, Menu } from 'obsidian';

jest.mock('obsidian');

describe('TocAsMarkdownPlugin Context Menu', () => {
  let plugin: TocAsMarkdownPlugin;
  let mockApp: any;
  let mockManifest: any;

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
      },
      fileManager: {
        processFrontMatter: jest.fn()
      }
    };

    mockManifest = {
      id: 'obsidian-toc-as-markdown',
      name: 'TOC as Markdown',
      version: '1.0.0'
    };

    plugin = new TocAsMarkdownPlugin(mockApp, mockManifest);
    await plugin.onload(); // Initialize the plugin
  });

  describe('context menu behavior', () => {
    it('should add TOC menu item for markdown files', () => {
      const mockFile = {
        extension: 'md',
        name: 'test.md',
        path: 'test.md',
        vault: mockApp.vault,
        parent: null
      } as TFile;

      const mockMenu = new Menu();
      const addItemSpy = jest.spyOn(mockMenu, 'addItem');

      plugin.onFileMenuEvent(mockMenu, mockFile);

      expect(addItemSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not add TOC menu item for non-markdown files', () => {
      const mockFile = {
        extension: 'txt',
        name: 'test.txt',
        path: 'test.txt',
        vault: mockApp.vault,
        parent: null
      } as TFile;

      const mockMenu = new Menu();
      const addItemSpy = jest.spyOn(mockMenu, 'addItem');

      plugin.onFileMenuEvent(mockMenu, mockFile);

      expect(addItemSpy).not.toHaveBeenCalled();
    });

    it('should add TOC menu item for folders', () => {
      const mockFolder = {
        name: 'test-folder',
        path: 'test-folder',
        isRoot: () => false,
        vault: mockApp.vault,
        parent: null,
        children: []
      } as unknown as TFolder;

      const mockMenu = new Menu();
      const addItemSpy = jest.spyOn(mockMenu, 'addItem');

      plugin.onFolderMenuEvent(mockMenu, mockFolder);

      expect(addItemSpy).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('addTocToFile', () => {
    it('should generate and insert TOC for a markdown file', async () => {
      const mockFile = {
        extension: 'md',
        name: 'test.md',
        path: 'test.md'
      } as TFile;

      const fileContent = `# Introduction
This is the introduction.

## Getting Started
Instructions for getting started.

### Prerequisites
What you need to know.`;

      const expectedTocContent = `# Introduction
This is the introduction.


## Table of Contents
- [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)

## Getting Started
Instructions for getting started.

### Prerequisites
What you need to know.`;

      mockApp.vault.read.mockResolvedValue(fileContent);
      mockApp.vault.modify.mockResolvedValue(undefined);

      await plugin.addTocToFile(mockFile);

      expect(mockApp.vault.read).toHaveBeenCalledWith(mockFile);
      expect(mockApp.vault.modify).toHaveBeenCalledWith(mockFile, expectedTocContent);
    });

    it('should handle files with no headers gracefully', async () => {
      const mockFile = {
        extension: 'md',
        name: 'test.md',
        path: 'test.md'
      } as TFile;

      const fileContent = 'Just some text with no headers.';

      mockApp.vault.read.mockResolvedValue(fileContent);

      await plugin.addTocToFile(mockFile);

      expect(mockApp.vault.read).toHaveBeenCalledWith(mockFile);
      expect(mockApp.vault.modify).not.toHaveBeenCalled();
    });

    it('should handle file read errors gracefully', async () => {
      const mockFile = {
        extension: 'md',
        name: 'test.md',
        path: 'test.md'
      } as TFile;

      mockApp.vault.read.mockRejectedValue(new Error('File not found'));

      await expect(plugin.addTocToFile(mockFile)).rejects.toThrow('File not found');
    });
  });

  describe('addTocToAllFilesInFolder', () => {
    it('should process all markdown files in a folder', async () => {
      const mockFolder = {
        name: 'test-folder',
        path: 'test-folder',
        isRoot: () => false,
        vault: mockApp.vault,
        parent: null,
        children: [
          { extension: 'md', name: 'file1.md', path: 'test-folder/file1.md', vault: mockApp.vault, parent: null } as TFile,
          { extension: 'md', name: 'file2.md', path: 'test-folder/file2.md', vault: mockApp.vault, parent: null } as TFile,
          { extension: 'txt', name: 'readme.txt', path: 'test-folder/readme.txt', vault: mockApp.vault, parent: null } as TFile
        ]
      } as unknown as TFolder;

      const addTocToFileSpy = jest.spyOn(plugin, 'addTocToFile').mockResolvedValue();

      await plugin.addTocToAllFilesInFolder(mockFolder);

      expect(addTocToFileSpy).toHaveBeenCalledTimes(2);
      expect(addTocToFileSpy).toHaveBeenCalledWith(mockFolder.children[0]);
      expect(addTocToFileSpy).toHaveBeenCalledWith(mockFolder.children[1]);
    });

    it('should handle empty folders gracefully', async () => {
      const mockFolder = {
        name: 'empty-folder',
        path: 'empty-folder',
        isRoot: () => false,
        vault: mockApp.vault,
        parent: null,
        children: []
      } as unknown as TFolder;

      const addTocToFileSpy = jest.spyOn(plugin, 'addTocToFile').mockResolvedValue();

      await plugin.addTocToAllFilesInFolder(mockFolder);

      expect(addTocToFileSpy).not.toHaveBeenCalled();
    });
  });
});