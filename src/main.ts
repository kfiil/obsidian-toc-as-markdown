import { Plugin, TFile, TFolder, Menu, MenuItem } from 'obsidian';
import { TocAsMarkdownSettings, FormatOptions } from './types';
import { TocGenerator } from './toc-generator';

const DEFAULT_SETTINGS: TocAsMarkdownSettings = {
  formatType: 'bullets',
  indentSize: 2,
  includeLinks: true,
  linkFormat: 'obsidian',
  minHeaderLevel: 1,
  maxHeaderLevel: 6,
  insertionMethod: 'beginning'
};

export class TocAsMarkdownPlugin extends Plugin {
  settings: TocAsMarkdownSettings = DEFAULT_SETTINGS;
  tocGenerator!: TocGenerator;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.tocGenerator = new TocGenerator();

    // Add commands that can be triggered from command palette
    this.addCommand({
      id: 'add-toc-to-current-file',
      name: 'Add Table of Contents to current file',
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.extension === 'md') {
          this.addTocToFile(activeFile);
        }
      }
    });

    this.addCommand({
      id: 'add-toc-to-folder',
      name: 'Add TOC to all files in current folder',
      callback: () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile && activeFile.parent) {
          this.addTocToAllFilesInFolder(activeFile.parent);
        }
      }
    });

    // Register event listeners for context menus using proper Obsidian API
    // Note: These events might only be available when the plugin runs in actual Obsidian
    
    // Hook into file context menu
    this.registerEvent(
      (this.app.workspace as any).on('file-menu', (menu: Menu, file: TFile) => {
        if (file instanceof TFile && file.extension === 'md') {
          this.onFileMenuEvent(menu, file);
        }
      })
    );

    // Hook into folder context menu  
    this.registerEvent(
      (this.app.workspace as any).on('folder-menu', (menu: Menu, folder: TFolder) => {
        if (folder instanceof TFolder) {
          this.onFolderMenuEvent(menu, folder);
        }
      })
    );

    // Also add ribbon icon for easy access
    this.addRibbonIcon('list-ordered', 'Add TOC to current file', () => {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile && activeFile.extension === 'md') {
        this.addTocToFile(activeFile);
      }
    });
  }

  onFileMenuEvent(menu: Menu, file: TFile): void {
    if (file.extension !== 'md') {
      return;
    }

    menu.addItem((item: MenuItem) => {
      item
        .setTitle('Add Table of Contents')
        .setIcon('list-ordered')
        .onClick(async () => {
          await this.addTocToFile(file);
        });
    });
  }

  onFolderMenuEvent(menu: Menu, folder: TFolder): void {
    menu.addItem((item: MenuItem) => {
      item
        .setTitle('Add TOC to all files')
        .setIcon('list-ordered')
        .onClick(async () => {
          await this.addTocToAllFilesInFolder(folder);
        });
    });
  }

  async addTocToFile(file: TFile): Promise<void> {
    try {
      const content = await this.app.vault.read(file);
      const headers = this.tocGenerator.extractHeaders(content);

      if (headers.length === 0) {
        // No headers found - could show a notice here
        return;
      }

      const formatOptions: FormatOptions = {
        formatType: this.settings.formatType,
        indentSize: this.settings.indentSize,
        includeLinks: this.settings.includeLinks,
        linkFormat: this.settings.linkFormat,
        levelRange: {
          min: this.settings.minHeaderLevel,
          max: this.settings.maxHeaderLevel
        }
      };

      const tocResult = this.tocGenerator.generateTocMarkdown(headers, formatOptions);

      if (!tocResult.success) {
        return;
      }

      const updatedContent = this.insertTocIntoContent(content, tocResult.tocMarkdown);
      await this.app.vault.modify(file, updatedContent);

    } catch (error) {
      throw error;
    }
  }

  async addTocToAllFilesInFolder(folder: TFolder): Promise<void> {
    const markdownFiles = this.getAllMarkdownFilesInFolder(folder);

    for (const file of markdownFiles) {
      await this.addTocToFile(file);
    }
  }

  private getAllMarkdownFilesInFolder(folder: TFolder): TFile[] {
    const markdownFiles: TFile[] = [];

    const processChildren = (children: any[]) => {
      for (const child of children) {
        // Check if it's a markdown file based on extension property
        if (child.extension === 'md') {
          markdownFiles.push(child as TFile);
        } else if (child.children) { // If it has children, it's a folder
          processChildren(child.children);
        }
      }
    };

    processChildren(folder.children);
    return markdownFiles;
  }

  private insertTocIntoContent(content: string, tocMarkdown: string): string {
    const lines = content.split('\n');
    const tocSection = `## Table of Contents\n${tocMarkdown}`;

    if (this.settings.insertionMethod === 'beginning') {
      let insertIndex = 0;

      // Handle frontmatter - skip it completely
      if (lines[0]?.trim() === '---') {
        insertIndex = 1;
        // Find the end of frontmatter
        while (insertIndex < lines.length && lines[insertIndex]?.trim() !== '---') {
          insertIndex++;
        }
        if (insertIndex < lines.length && lines[insertIndex]?.trim() === '---') {
          insertIndex++; // Move past the closing ---
        }
      }

      // Skip any empty lines after frontmatter
      while (insertIndex < lines.length && lines[insertIndex]?.trim() === '') {
        insertIndex++;
      }

      // If there's a title (H1), place TOC after title
      if (insertIndex < lines.length && lines[insertIndex]?.trim().startsWith('# ')) {
        insertIndex++; // Move past the title
        // Skip empty line after title if it exists
        if (insertIndex < lines.length && lines[insertIndex]?.trim() === '') {
          insertIndex++;
        }
      }

      // Insert TOC with proper spacing
      lines.splice(insertIndex, 0, tocSection, '');
    } else if (this.settings.insertionMethod === 'end') {
      lines.push('', tocSection);
    }

    return lines.join('\n');
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

}