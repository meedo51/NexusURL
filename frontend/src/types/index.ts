export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  notificationEnabled: boolean;
  shortCodeLength: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  apiKey?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Link {
  id: string;
  shortUrl: string;
  shortCode: string;
  longUrl: string;
  clicks: number;
  uniqueVisitors: number;
  hasPassword: boolean;
  expirationDate?: string;
  oneTimeAccess: boolean;
  isActive: boolean;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkStats {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: { date: string; count: number }[];
  topReferrers: { referer: string; count: number }[];
  devices: { type: string; count: number }[];
  browsers: { name: string; count: number }[];
  countries: { country: string; count: number }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}
