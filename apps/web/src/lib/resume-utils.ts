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

/**
 * 从后端API获取渲染后的简历HTML
 * @param resumeId 简历ID
 * @returns Promise<string> 格式化的HTML内容
 */
export const fetchRenderedResumeHtml = async (resumeId: string): Promise<string> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/resumes/${resumeId}/render`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rendered resume: ${response.statusText}`);
    }

    const html = await response.text();
    return html || DEFAULT_RESUME_CONTENT;
  } catch (error) {
    console.error('Error fetching rendered resume:', error);
    // 降级到默认内容
    return DEFAULT_RESUME_CONTENT;
  }
};

/**
 * 获取结构化简历数据
 * @param resumeId 简历ID
 * @returns Promise<any> 结构化数据
 */
export const fetchStructuredResumeData = async (resumeId: string): Promise<any> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/resumes/${resumeId}/structured`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch structured resume: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching structured resume:', error);
    return null;
  }
};

