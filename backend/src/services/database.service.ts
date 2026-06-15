import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.prisma.$on('error' as any, (e: any) => {
      logger.error('Prisma error:', e);
    });

    this.prisma.$on('warn' as any, (e: any) => {
      logger.warn('Prisma warn:', e);
    });
  }

  get client(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
    logger.info('Connected to PostgreSQL');
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL');
  }

  // User operations
  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
    });
  }

  async findUserByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' }, deletedAt: null },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findUserByApiKey(apiKey: string) {
    return this.prisma.user.findFirst({
      where: { apiKey, deletedAt: null },
    });
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
    emailVerificationToken?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async updateUser(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDeleteUser(id: string) {
    const anonUsername = `deleted_${id.substring(0, 8)}`;
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        username: anonUsername,
        email: `${id.substring(0, 8)}@deleted.nexusurl`,
        bio: '',
        apiKey: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      },
    });
  }

  // Link operations
  async createLink(data: {
    userId?: string;
    longUrl: string;
    shortCode: string;
    customAlias?: string;
    isCustom?: boolean;
    passwordHash?: string;
    expirationDate?: Date;
    oneTimeAccess?: boolean;
  }) {
    return this.prisma.link.create({ data });
  }

  async findLinkByShortCode(shortCode: string) {
    return this.prisma.link.findUnique({
      where: { shortCode },
      include: { user: { select: { notificationEnabled: true, email: true, username: true } } },
    });
  }

  async findLinkById(id: string) {
    return this.prisma.link.findUnique({ where: { id } });
  }

  async findUserLinkById(id: string, userId: string) {
    return this.prisma.link.findFirst({
      where: { id, userId, isActive: true },
    });
  }

  async getUserLinks(userId: string, params: {
    skip: number;
    take: number;
    orderBy: any;
    search?: string;
    status?: string;
  }) {
    const where: any = { userId, isActive: true };
    if (params.search) {
      where.OR = [
        { longUrl: { contains: params.search, mode: 'insensitive' } },
        { shortCode: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status === 'expired') {
      where.expirationDate = { lt: new Date() };
    } else if (params.status === 'active') {
      where.OR = [
        { expirationDate: null },
        { expirationDate: { gte: new Date() } },
      ];
    }

    const [links, total] = await Promise.all([
      this.prisma.link.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: {
          _count: { select: { linkLogs: true } },
        },
      }),
      this.prisma.link.count({ where }),
    ]);

    return { links, total };
  }

  async updateLink(id: string, data: any) {
    return this.prisma.link.update({ where: { id }, data });
  }

  async softDeleteLink(id: string) {
    return this.prisma.link.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async incrementLinkAccess(linkId: string, isNewVisitor: boolean) {
    const data: any = { accessCount: { increment: 1 } };
    if (isNewVisitor) {
      data.uniqueVisitors = { increment: 1 };
    }
    return this.prisma.link.update({
      where: { id: linkId },
      data,
    });
  }

  // Link log operations
  async createLinkLog(data: {
    linkId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    countryCode?: string;
    city?: string;
    deviceType?: string;
    browserName?: string;
    osName?: string;
  }) {
    return this.prisma.linkLog.create({ data });
  }

  async getLinkStats(linkId: string) {
    const logs = await this.prisma.linkLog.findMany({
      where: { linkId },
      orderBy: { accessedAt: 'desc' },
    });

    const link = await this.prisma.link.findUnique({ where: { id: linkId } });

    const clicksByDay: Record<string, number> = {};
    const topReferrers: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const uniqueIps = new Set<string>();

    logs.forEach(log => {
      const day = log.accessedAt.toISOString().split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
      if (log.referer) topReferrers[log.referer] = (topReferrers[log.referer] || 0) + 1;
      if (log.deviceType) devices[log.deviceType] = (devices[log.deviceType] || 0) + 1;
      if (log.browserName) browsers[log.browserName] = (browsers[log.browserName] || 0) + 1;
      if (log.countryCode) countries[log.countryCode] = (countries[log.countryCode] || 0) + 1;
      if (log.ipAddress) uniqueIps.add(log.ipAddress);
    });

    return {
      totalClicks: link?.accessCount || 0,
      uniqueVisitors: uniqueIps.size,
      clicksByDay: Object.entries(clicksByDay).map(([date, count]) => ({ date, count })),
      topReferrers: Object.entries(topReferrers)
        .map(([referer, count]) => ({ referer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      devices: Object.entries(devices).map(([type, count]) => ({ type, count })),
      browsers: Object.entries(browsers).map(([name, count]) => ({ name, count })),
      countries: Object.entries(countries).map(([country, count]) => ({ country, count })),
    };
  }

  // One-time tokens
  async createOneTimeToken(data: { linkId: string; tokenHash: string; expiresAt: Date }) {
    return this.prisma.oneTimeToken.create({ data });
  }

  async findOneTimeToken(tokenHash: string) {
    return this.prisma.oneTimeToken.findUnique({ where: { tokenHash } });
  }

  async markTokenAsUsed(id: string) {
    return this.prisma.oneTimeToken.update({
      where: { id },
      data: { isUsed: true },
    });
  }

  // Email queue
  async addToEmailQueue(data: {
    toEmail: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    priority?: number;
  }) {
    return this.prisma.emailQueue.create({ data });
  }

  async getPendingEmails(limit: number = 10) {
    return this.prisma.emailQueue.findMany({
      where: { status: 'pending', scheduledFor: { lte: new Date() } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    });
  }

  async updateEmailStatus(id: string, status: string, error?: string) {
    const data: any = { status };
    if (status === 'sent') data.sentAt = new Date();
    if (error) {
      data.lastError = error;
      data.retryCount = { increment: 1 };
    }
    return this.prisma.emailQueue.update({ where: { id }, data });
  }

  // Sessions
  async createSession(data: {
    userId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return this.prisma.userSession.create({ data });
  }

  async getUserSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async deleteUserSessions(userId: string) {
    return this.prisma.userSession.deleteMany({ where: { userId } });
  }

  async deleteSession(id: string) {
    return this.prisma.userSession.delete({ where: { id } });
  }
}

export const db = new DatabaseService();
export default db;
