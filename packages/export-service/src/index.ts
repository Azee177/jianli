export type ExportFormat = "pdf" | "docx";

export interface ExportRequest {
  journeyId: string;
  resumeVersionId: string;
  format: ExportFormat;
}

export interface ExportArtifact {
  buffer: ArrayBuffer;
  mimeType: string;
  filename: string;
}

/**
 * Placeholder renderer that returns a simple text buffer. Real implementation
 * will call docx / pdf rendering pipelines.
 */
export async function renderExport(
  request: ExportRequest,
): Promise<ExportArtifact> {
  const content = [
    `Resume Copilot export - ${request.format.toUpperCase()}`,
    `Journey: ${request.journeyId}`,
    `Version: ${request.resumeVersionId}`,
    `Generated: ${new Date().toISOString()}`,
  ].join("\n");

  const encoder = new TextEncoder();
  return {
    buffer: encoder.encode(content).buffer,
    mimeType: request.format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: `resume-${request.resumeVersionId}.${request.format}`,
  };
}

