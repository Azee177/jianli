export interface OcrResult {
  text: string;
  page: number;
}

export interface ResumeAst {
  blocks: Array<{
    id: string;
    label: string;
    content: string;
  }>;
  metadata: Record<string, string | undefined>;
}

/**
 * parseResume is a placeholder for the OCR + layout pipeline. During early
 * development it accepts raw text and wraps it into a structured AST so that
 * other services can be developed without running the heavy OCR toolchain.
 */
export function parseResume(rawText: string): ResumeAst {
  const lines = rawText.split(/\r?\n/).filter(Boolean);

  return {
    blocks: lines.map((line, index) => ({
      id: `block-${index}`,
      label: index === 0 ? "header" : "paragraph",
      content: line,
    })),
    metadata: {
      source: "mock-ocr",
      generatedAt: new Date().toISOString(),
    },
  };
}

export function extractOcr(text: string): OcrResult[] {
  return text.split(/\f/).map((page, index) => ({
    page: index + 1,
    text: page.trim(),
  }));
}

