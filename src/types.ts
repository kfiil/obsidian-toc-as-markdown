export type TocAsMarkdownSettings = {
  formatType: 'bullets' | 'numbers' | 'mixed';
  indentSize: number;
  includeLinks: boolean;
  minHeaderLevel: number;
  maxHeaderLevel: number;
  insertionMethod: 'cursor' | 'beginning' | 'end';
};

export type HeaderEntry = {
  level: number;
  text: string;
  anchor: string;
  lineNumber: number;
};

export type TocStructure = {
  headers: HeaderEntry[];
  hierarchyMap: Map<number, HeaderEntry[]>;
};

export type FormatOptions = {
  formatType: TocAsMarkdownSettings['formatType'];
  indentSize: number;
  includeLinks: boolean;
  levelRange: {
    min: number;
    max: number;
  };
};

export type TocGenerationResult = {
  success: true;
  tocMarkdown: string;
  headersFound: number;
} | {
  success: false;
  error: string;
};