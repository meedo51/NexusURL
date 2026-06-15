import nodemailer from 'nodemailer';
import { config } from '../config';
import db from '../services/database.service';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const RETRY_DELAYS = [60000, 300000, 900000, 3600000];

async function processEmails(): Promise<void> {
  try {
    const emails = await db.getPendingEmails(10);

    for (const email of emails) {
      try {
        await db.updateEmailStatus(email.id, 'processing');

        await transporter.sendMail({
          from: `"NexusURL" <${config.email.from}>`,
          replyTo: config.email.replyTo,
          to: email.toEmail,
          subject: email.subject,
          html: email.htmlContent,
          text: email.textContent || undefined,
        });

        await db.updateEmailStatus(email.id, 'sent');
        logger.info(`Email sent to ${email.toEmail}: ${email.subject}`);
      } catch (error: any) {
        logger.error(`Failed to send email to ${email.toEmail}:`, error.message);

        if (email.retryCount < RETRY_DELAYS.length) {
          const nextRetry = new Date(Date.now() + RETRY_DELAYS[email.retryCount]);
          await db.updateEmailStatus(email.id, 'pending', error.message);
          await db.client.emailQueue.update({
            where: { id: email.id },
            data: { scheduledFor: nextRetry },
          });
        } else {
          await db.updateEmailStatus(email.id, 'failed', error.message);
          logger.error(`Email permanently failed for ${email.toEmail} after ${RETRY_DELAYS.length} retries`);
        }
      }
    }
  } catch (error) {
    logger.error('Email worker error:', error);
  }
}

async function startWorker(): Promise<void> {
  logger.info('Email worker started');
  await db.connect();

  setInterval(processEmails, 10000);
  processEmails();

  process.on('SIGTERM', async () => {
    logger.info('Email worker shutting down');
    await db.disconnect();
    process.exit(0);
  });
}

startWorker().catch(err => {
  logger.error('Failed to start email worker:', err);
  process.exit(1);
});
