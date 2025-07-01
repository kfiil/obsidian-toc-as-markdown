import { HeaderEntry, FormatOptions, TocGenerationResult, TocStructure } from './types';

export class TocGenerator {
  private anchorCache = new Map<string, number>();

  extractHeaders(content: string): HeaderEntry[] {
    if (!content || content.trim() === '') {
      return [];
    }

    const lines = content.split('\n');
    const headers: HeaderEntry[] = [];
    this.anchorCache.clear();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2].trim();
        const anchor = this.createAnchorLink(text);
        
        headers.push({
          level,
          text,
          anchor,
          lineNumber: i + 1
        });
      }
    }

    return headers;
  }

  generateTocMarkdown(headers: HeaderEntry[], formatOptions: FormatOptions): TocGenerationResult {
    const filteredHeaders = this.filterHeadersByLevel(headers, formatOptions.levelRange);
    
    if (filteredHeaders.length === 0) {
      return {
        success: false,
        error: 'No headers found in the specified range'
      };
    }

    const tocLines = this.formatHeaders(filteredHeaders, formatOptions);
    
    return {
      success: true,
      tocMarkdown: tocLines.join('\n'),
      headersFound: filteredHeaders.length
    };
  }

  createAnchorLink(text: string): string {
    const baseAnchor = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const existingCount = this.anchorCache.get(baseAnchor) || 0;
    this.anchorCache.set(baseAnchor, existingCount + 1);

    return existingCount === 0 ? baseAnchor : `${baseAnchor}-${existingCount}`;
  }

  private filterHeadersByLevel(headers: HeaderEntry[], levelRange: { min: number; max: number }): HeaderEntry[] {
    return headers.filter(header => 
      header.level >= levelRange.min && header.level <= levelRange.max
    );
  }

  private formatHeaders(headers: HeaderEntry[], formatOptions: FormatOptions): string[] {
    const lines: string[] = [];
    const minLevel = Math.min(...headers.map(h => h.level));

    for (const header of headers) {
      const relativeLevel = header.level - minLevel;
      const indent = ' '.repeat(relativeLevel * formatOptions.indentSize);
      const linkText = formatOptions.includeLinks 
        ? `[${header.text}](#${header.anchor})`
        : header.text;

      if (formatOptions.formatType === 'bullets') {
        lines.push(`${indent}- ${linkText}`);
      } else if (formatOptions.formatType === 'numbers') {
        lines.push(`${indent}1. ${linkText}`);
      } else { // mixed
        const bullet = relativeLevel === 0 ? '1.' : '-';
        lines.push(`${indent}${bullet} ${linkText}`);
      }
    }

    return lines;
  }

  buildTocStructure(headers: HeaderEntry[]): TocStructure {
    const hierarchyMap = new Map<number, HeaderEntry[]>();

    for (const header of headers) {
      if (!hierarchyMap.has(header.level)) {
        hierarchyMap.set(header.level, []);
      }
      hierarchyMap.get(header.level)!.push(header);
    }

    return {
      headers,
      hierarchyMap
    };
  }
}