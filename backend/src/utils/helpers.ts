import { v4 as uuidv4 } from 'uuid';
import { SHORT_CODE_CHARS } from '../types';

export function generateRequestId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 12);
}

export function generateShortCode(
  length: number,
  options: { includeUppercase: boolean; includeLowercase: boolean; includeNumbers: boolean }
): string {
  let chars = '';
  if (options.includeUppercase) chars += SHORT_CODE_CHARS.uppercase;
  if (options.includeLowercase) chars += SHORT_CODE_CHARS.lowercase;
  if (options.includeNumbers) chars += SHORT_CODE_CHARS.numbers;
  if (!chars) chars = SHORT_CODE_CHARS.lowercase + SHORT_CODE_CHARS.numbers;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateShortUrl(shortCode: string): string {
  return `http://xus.me/${shortCode}`;
}

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'nx_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    let code = '';
    for (let j = 0; j < 4; j++) {
      code += Math.floor(Math.random() * 10).toString();
      if (j < 3) code += '-';
    }
    codes.push(code);
  }
  return codes;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function isValidShortCode(code: string): boolean {
  return /^[A-Za-z0-9\-_]+$/.test(code) && code.length <= 50;
}

export function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  const uaLower = ua.toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'desktop';

  if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('edge')) browser = 'Edge';
  else if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('safari')) browser = 'Safari';
  else if (uaLower.includes('opera')) browser = 'Opera';

  if (uaLower.includes('windows')) os = 'Windows';
  else if (uaLower.includes('mac')) os = 'macOS';
  else if (uaLower.includes('linux')) os = 'Linux';
  else if (uaLower.includes('android')) os = 'Android';
  else if (uaLower.includes('ios')) os = 'iOS';

  if (uaLower.includes('mobile')) device = 'mobile';
  else if (uaLower.includes('tablet')) device = 'tablet';

  return { browser, os, device };
}

export function getPaginationParams(query: any): {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  order: 'asc' | 'desc';
  search: string | undefined;
} {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'created_at';
  const order = query.order === 'asc' ? 'asc' : 'desc';
  const search = query.search || undefined;
  return { page, limit, skip, sortBy, order, search };
}
