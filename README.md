# TOC as Markdown - Obsidian Plugin

Generate table of contents as markdown from document headers with right-click context menu functionality.

## Features

- **Right-click Context Menu**: Add TOC to individual markdown files or entire folders
- **Multiple Format Support**: Bullets, numbers, or mixed formatting styles  
- **Smart Header Detection**: Automatically detects and processes H1-H6 headers
- **Anchor Link Generation**: Creates internal links with collision resolution
- **Configurable Options**: Control indentation, header levels, and insertion position
- **Command Palette Integration**: Quick access through Obsidian's command palette
- **Ribbon Icon**: One-click TOC generation for the current file

## Usage

### Context Menu (Right-click)
1. **For Files**: Right-click any markdown file → "Add Table of Contents"
2. **For Folders**: Right-click any folder → "Add TOC to all files" (processes all .md files)

### Command Palette
- `Ctrl/Cmd + P` → "Add Table of Contents to current file"
- `Ctrl/Cmd + P` → "Add TOC to all files in current folder"

### Ribbon Icon
- Click the list icon in the left ribbon to add TOC to the current file

## Example Output

Given a markdown file with headers:
```markdown
# Introduction
Some content here.

## Getting Started  
Instructions for getting started.

### Prerequisites
What you need to know.

## Advanced Usage
More advanced topics.
```

The plugin generates:
```markdown
# Introduction
Some content here.

## Table of Contents
- [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
  - [Advanced Usage](#advanced-usage)

## Getting Started
Instructions for getting started.

### Prerequisites
What you need to know.

## Advanced Usage
More advanced topics.
```

## Configuration

The plugin supports various configuration options:
- **Format Type**: Bullets, numbers, or mixed
- **Indentation**: Customizable spacing for nested levels
- **Header Levels**: Include/exclude specific header levels (H1-H6)
- **Insertion Method**: Beginning, cursor position, or end of file
- **Link Generation**: Toggle anchor links on/off

## Installation

### Manual Installation
1. Download the latest release
2. Extract to your Obsidian plugins folder: `VaultFolder/.obsidian/plugins/obsidian-toc-as-markdown/`
3. Enable the plugin in Obsidian Settings → Community Plugins

### Development
1. Clone this repository
2. Run `npm install`
3. Run `npm run build`
4. Copy the built files to your Obsidian plugins folder

## Development

This plugin follows strict Test-Driven Development (TDD) principles:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Technical Details

- **Language**: TypeScript with strict mode
- **Testing**: Jest with 100% coverage requirement
- **Build System**: esbuild for fast compilation
- **Code Quality**: ESLint with comprehensive rules
- **Architecture**: Modular design with separation of concerns

## Contributing

Contributions are welcome! Please ensure:
1. All tests pass (`npm test`)
2. Code follows TDD principles
3. TypeScript strict mode compliance
4. 100% test coverage maintained

## License

MIT License - see LICENSE file for details.