E:\Code\jianli\docs\OCR1.0.mdimport { BadRequestException, Injectable } from "@nestjs/common";
import { PdfOcrService } from "./pdf-ocr.service";
import { ResumeParser } from "./resume.parser";
import { ResumeRepository } from "./resume.repository";
import { ResumeBlock, ResumeRecord, ResumeResponse } from "./resume.types";

export interface ResumeDraft {
  versionId: string;
  journeyId: string;
  type: "ORIGINAL" | "DRAFT_V1" | "ITERATION" | "COMPANY_QUARTER" | "FINAL";
  summary: string;
  updatedAt: string;
}

const DEFAULT_USER_ID = "demo-user";

@Injectable()
export class ResumeService {
  constructor(
    private readonly repository: ResumeRepository,
    private readonly parser: ResumeParser,
    private readonly pdfOcr: PdfOcrService,
  ) {}

  async createFromUpload(input: {
    userId?: string;
    file?: Express.Multer.File;
    text?: string;
    templateKey?: string;
    title?: string;
  }): Promise<ResumeResponse> {
    const userId = input.userId ?? DEFAULT_USER_ID;
    let rawText = (input.text ?? "").trim();
    let pageCount: number | undefined;
    let confidence: number | undefined;
    let ocrEngine: "pdf-text" | "ocr-image" | "manual" | undefined;

    if (!rawText) {
      const ocr = await this.pdfOcr.extractText(input.file);
      rawText = ocr.text.trim();
      pageCount = ocr.pageCount;
      confidence = ocr.confidence;
      ocrEngine = ocr.engine;
    }

    if (!rawText) {
      throw new BadRequestException("无法从上传的文件中提取任何文本，请检查文件是否包含可识别内容。");
    }

    const parsed = this.parser.parse(rawText);

    const record = this.repository.create({
      userId,
      source: "UPLOAD",
      templateKey: input.templateKey,
      title: input.title,
      fileName: input.file?.originalname,
      rawText: parsed.normalized,
      parsedBlocks: parsed.blocks,
      skills: parsed.skills,
      contacts: parsed.contacts,
      metadata: {
        ocrEngine: ocrEngine ?? "manual",
        pageCount,
        confidence,
        language: parsed.detectedLanguage,
      },
    });

    return this.toResponse(record);
  }

  createBlankResume(input: { userId?: string; templateKey?: string; title?: string }): ResumeResponse {
    const userId = input.userId ?? DEFAULT_USER_ID;
    const templateKey = input.templateKey ?? "modern-cn";
    const { rawText, blocks } = this.parser.buildBlankTemplate(templateKey, input.title);
    const parsed = this.parser.parse(rawText);

    const record = this.repository.create({
      userId,
      source: "TEMPLATE",
      templateKey,
      title: input.title,
      rawText: rawText,
      parsedBlocks: blocks,
      skills: parsed.skills,
      contacts: parsed.contacts,
      metadata: {
        ocrEngine: "manual",
        language: parsed.detectedLanguage,
      },
    });

    return this.toResponse(record);
  }

  listResumes(userId?: string): ResumeResponse[] {
    const records = this.repository.listByUser(userId ?? DEFAULT_USER_ID);
    return records.map((record) => this.toResponse(record));
  }

  listDrafts(userId?: string): ResumeDraft[] {
    const records = this.repository.listByUser(userId ?? DEFAULT_USER_ID);
    return records.map((record) => ({
      versionId: record.id,
      journeyId: "demo-journey-001",
      type: record.source === "UPLOAD" ? "ORIGINAL" : "DRAFT_V1",
      summary: this.buildSummary(record.parsedBlocks, record.rawText),
      updatedAt: record.updatedAt.toISOString(),
    }));
  }

  getLatestDraft(userId?: string): ResumeDraft | null {
    const latest = this.repository.latestByUser(userId ?? DEFAULT_USER_ID);
    if (!latest) {
      return null;
    }
    return {
      versionId: latest.id,
      journeyId: "demo-journey-001",
      type: latest.source === "UPLOAD" ? "ORIGINAL" : "DRAFT_V1",
      summary: this.buildSummary(latest.parsedBlocks, latest.rawText),
      updatedAt: latest.updatedAt.toISOString(),
    };
  }

  findResumeById(id: string, userId?: string): ResumeResponse | null {
    const record = this.repository.findById(id);
    if (!record) {
      return null;
    }
    if (userId && record.userId !== userId) {
      return null;
    }
    return this.toResponse(record);
  }

  private buildSummary(blocks: ResumeBlock[], rawText: string): string {
    const block = blocks.find((item) => item.type === "summary") ?? blocks[0];
    if (block) {
      const summary = block.text.replace(/\s+/g, " ").trim();
      if (summary.length > 0) {
        return summary.slice(0, 140);
      }
    }
    return rawText.replace(/\s+/g, " ").slice(0, 140);
  }

  private toResponse(record: ResumeRecord): ResumeResponse {
    return {
      id: record.id,
      raw_text: record.rawText,
      parsed_blocks: record.parsedBlocks,
      skills: record.skills,
      contacts: record.contacts,
      metadata: {
        ...(record.metadata ?? {}),
        source: record.source,
        templateKey: record.templateKey,
        title: record.title,
      },
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
    };
  }
}
