import { DEFAULT_RESUME_CONTENT } from './constants';

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const convertPlainTextToHtml = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map(block => {
      const normalized = block.trim();
      if (!normalized) {
        return '';
      }
      const escaped = escapeHtml(normalized).replace(/\n/g, '<br />');
      return `<p>${escaped}</p>`;
    })
    .filter(Boolean)
    .join('');

  return paragraphs || `<p>${escapeHtml(trimmed)}</p>`;
};

export const deriveResumeContent = (resumeData: any, fallback = DEFAULT_RESUME_CONTENT): string => {
  if (!resumeData) {
    return fallback;
  }

  const directContent =
    typeof resumeData.content === 'string' && resumeData.content.trim().length > 0
      ? resumeData.content
      : typeof resumeData.html === 'string' && resumeData.html.trim().length > 0
        ? resumeData.html
        : undefined;

  if (directContent) {
    return directContent;
  }

  const raw =
    typeof resumeData.rawText === 'string'
      ? resumeData.rawText
      : typeof resumeData.raw_text === 'string'
        ? resumeData.raw_text
        : typeof resumeData.normalized === 'string'
          ? resumeData.normalized
          : undefined;

  if (raw && raw.trim().length > 0) {
    return convertPlainTextToHtml(raw) || fallback;
  }

  return fallback;
};

export const extractEditorHtmlFromResume = (resume: any): string => {
  if (!resume) {
    return DEFAULT_RESUME_CONTENT;
  }
  if (typeof resume.html === 'string' && resume.html.trim().length > 0) {
    return resume.html;
  }
  if (typeof resume.raw_text === 'string' && /<\w+/i.test(resume.raw_text)) {
    return resume.raw_text;
  }
  if (typeof resume.raw_text === 'string') {
    return convertPlainTextToHtml(resume.raw_text) || DEFAULT_RESUME_CONTENT;
  }
  return DEFAULT_RESUME_CONTENT;
};

