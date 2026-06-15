import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  username: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  requestId?: string;
}

export interface CreateLinkInput {
  longUrl: string;
  customAlias?: string;
  expirationDate?: string;
  password?: string;
  oneTimeAccess?: boolean;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  email?: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesInput {
  notificationEnabled?: boolean;
  shortCodeLength?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
}

export interface LinkStatsResponse {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: { date: string; count: number }[];
  topReferrers: { referer: string; count: number }[];
  devices: { type: string; count: number }[];
  browsers: { name: string; count: number }[];
  countries: { country: string; count: number }[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface EmailJob {
  to: string;
  subject: string;
  template: 'welcome' | 'link_visited' | 'password_reset' | '2fa_backup' | 'account_deleted';
  data: Record<string, any>;
}

export const SHORT_CODE_CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
};
