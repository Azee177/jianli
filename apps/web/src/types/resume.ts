export type ResumeSource = 'template' | 'upload' | 'blank';

export interface ResumeBlock {
  type: string;
  text: string;
}

export interface ResumeContacts {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface ResumeMetadata {
  ocrEngine?: string;
  pageCount?: number;
  confidence?: number;
  latencyMs?: number;
  sha256?: string;
  ocrGatewayUsed?: boolean;
  language?: string;
  templateKey?: string;
  title?: string;
  fileName?: string;
  mimeType?: string;
}

export interface ResumeData {
  id: string;
  title?: string;
  templateId?: string;
  content: string;
  rawText?: string;
  parsedBlocks?: ResumeBlock[];
  skills?: string[];
  contacts?: ResumeContacts;
  metadata?: ResumeMetadata;
  createdAt?: string;
  updatedAt?: string;
  source: ResumeSource;
}

