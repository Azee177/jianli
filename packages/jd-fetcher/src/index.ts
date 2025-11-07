import { request } from "undici";

export interface FetchJobOptions {
  url: string;
  journeyId: string;
}

export interface NormalizedJd {
  company: string;
  role: string;
  rawHtml: string;
  normalizedAt: string;
}

export async function fetchJobDescription(
  options: FetchJobOptions,
): Promise<NormalizedJd> {
  const response = await request(options.url);
  const html = await response.body.text();

  return {
    company: "Unknown",
    role: "Unknown",
    rawHtml: html,
    normalizedAt: new Date().toISOString(),
  };
}

export function normalizeFromText(text: string): NormalizedJd {
  return {
    company: "Manual Input",
    role: text.slice(0, 32),
    rawHtml: text,
    normalizedAt: new Date().toISOString(),
  };
}

