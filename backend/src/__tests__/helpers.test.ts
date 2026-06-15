import {
  generateShortCode,
  generateShortUrl,
  generateApiKey,
  generateBackupCodes,
  isValidUrl,
  isValidShortCode,
  parseUserAgent,
  getPaginationParams,
  generateRequestId,
} from '../utils/helpers';

describe('generateShortCode', () => {
  it('should generate code with specified length', () => {
    const code = generateShortCode(8, { includeUppercase: true, includeLowercase: true, includeNumbers: true });
    expect(code).toHaveLength(8);
  });

  it('should only use specified character sets', () => {
    const code = generateShortCode(10, { includeUppercase: true, includeLowercase: false, includeNumbers: false });
    expect(code).toMatch(/^[A-Z]+$/);
  });

  it('should fallback when no char set selected', () => {
    const code = generateShortCode(6, { includeUppercase: false, includeLowercase: false, includeNumbers: false });
    expect(code).toHaveLength(6);
  });
});

describe('generateShortUrl', () => {
  it('should generate correct short URL', () => {
    expect(generateShortUrl('abc123')).toBe('http://xus.me/abc123');
  });
});

describe('generateApiKey', () => {
  it('should generate key starting with nx_', () => {
    const key = generateApiKey();
    expect(key.startsWith('nx_')).toBe(true);
    expect(key.length).toBe(35);
  });
});

describe('generateBackupCodes', () => {
  it('should generate 10 codes', () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(10);
  });

  it('should generate codes in correct format', () => {
    const codes = generateBackupCodes();
    codes.forEach(code => {
      expect(code).toMatch(/^\d{1}-\d{1}-\d{1}-\d{1}$/);
    });
  });
});

describe('isValidUrl', () => {
  it('should accept valid http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('isValidShortCode', () => {
  it('should accept valid codes', () => {
    expect(isValidShortCode('abc123')).toBe(true);
    expect(isValidShortCode('my-link')).toBe(true);
    expect(isValidShortCode('test_code')).toBe(true);
  });

  it('should reject invalid codes', () => {
    expect(isValidShortCode('abc 123')).toBe(false);
    expect(isValidShortCode('')).toBe(false);
  });
});

describe('parseUserAgent', () => {
  it('should parse Chrome on Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
    const result = parseUserAgent(ua);
    expect(result.browser).toBe('Chrome');
    expect(result.os).toBe('Windows');
    expect(result.device).toBe('desktop');
  });

  it('should detect mobile', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36';
    const result = parseUserAgent(ua);
    expect(result.device).toBe('mobile');
  });
});

describe('getPaginationParams', () => {
  it('should return defaults for empty query', () => {
    const params = getPaginationParams({});
    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
    expect(params.order).toBe('desc');
  });

  it('should parse query params', () => {
    const params = getPaginationParams({ page: '2', limit: '10', sortBy: 'clicks', order: 'asc' });
    expect(params.page).toBe(2);
    expect(params.limit).toBe(10);
    expect(params.sortBy).toBe('clicks');
    expect(params.order).toBe('asc');
  });

  it('should enforce limits', () => {
    const params = getPaginationParams({ limit: '100' });
    expect(params.limit).toBe(50);
  });
});

describe('generateRequestId', () => {
  it('should generate a 12-character string', () => {
    const id = generateRequestId();
    expect(id).toHaveLength(12);
    expect(id).toMatch(/^[0-9a-f]+$/);
  });
});
