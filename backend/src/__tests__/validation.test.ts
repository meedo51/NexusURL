import { signupValidation, createLinkValidation } from '../middleware/validation.middleware';
import { Request, Response, NextFunction } from 'express';

function createMockReq(body: any): Partial<Request> {
  return { body, headers: {} } as any;
}

function createMockRes(): Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('signupValidation', () => {
  it('should reject empty username', async () => {
    const req = createMockReq({ username: '', email: 'test@test.com', password: 'Test1234!', confirmPassword: 'Test1234!' });
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of signupValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should reject short password', async () => {
    const req = createMockReq({ username: 'testuser', email: 'test@test.com', password: 'Short1!', confirmPassword: 'Short1!' });
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of signupValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should reject mismatched passwords', async () => {
    const req = createMockReq({ username: 'testuser', email: 'test@test.com', password: 'Test1234!', confirmPassword: 'Different1!' });
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of signupValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should reject password without uppercase', async () => {
    const req = createMockReq({ username: 'testuser', email: 'test@test.com', password: 'test1234!', confirmPassword: 'test1234!' });
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of signupValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should reject password without special char', async () => {
    const req = createMockReq({ username: 'testuser', email: 'test@test.com', password: 'Test12345', confirmPassword: 'Test12345' });
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of signupValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('createLinkValidation', () => {
  it('should reject missing URL', async () => {
    const req = createMockReq({});
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of createLinkValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should reject invalid URL', async () => {
    const req = createMockReq({ longUrl: 'not-a-url' });
    const res = createMockRes();
    const next = jest.fn();

    for (const validator of createLinkValidation) {
      await validator(req as Request, res as Response, next);
    }
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
