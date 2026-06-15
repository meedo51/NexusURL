import { config } from '../config';

export function getWelcomeEmailHtml(username: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NexusURL!</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Welcome to NexusURL! Your account has been successfully created.
        Start shortening your URLs, tracking analytics, and managing your links with ease.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.urls.frontend}/dashboard" style="background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Get Started
        </a>
      </div>
      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        If you didn't create this account, please ignore this email.
      </p>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; color: #888; font-size: 12px;">
      <p>&copy; 2024 NexusURL. All rights reserved.</p>
      <p>${config.email.from}</p>
    </div>
  </div>
</body>
</html>`;
}

export function getPasswordResetEmailHtml(username: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        If you didn't request a password reset, please ignore this email.
      </p>
    </div>
    <div style="background: #f8f8f8; padding: 20px; text-align: center; color: #888; font-size: 12px;">
      <p>&copy; 2024 NexusURL. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function getLinkVisitedEmailHtml(data: Record<string, any>): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Link Visited!</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #555;">Your link received a visit:</p>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Short URL:</strong> <a href="${data.shortUrl}">${data.shortUrl}</a></p>
        <p style="margin: 5px 0;"><strong>Long URL:</strong> ${data.longUrl}</p>
        <p style="margin: 5px 0;"><strong>Visited at:</strong> ${data.visitedAt}</p>
        <p style="margin: 5px 0;"><strong>From:</strong> ${data.ipAddress} (${data.country})</p>
      </div>
      <div style="text-align: center;">
        <a href="${data.statsUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
          View Statistics
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function get2faBackupCodesHtml(username: string, codes: string[]): string {
  const codesList = codes.map(c => `<li style="font-family: monospace; font-size: 16px; margin: 8px 0; background: #f8f8f8; padding: 8px 12px; border-radius: 4px;">${c}</li>`).join('');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">2FA Backup Codes</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
      <p style="font-size: 16px; color: #555;">Here are your backup codes for Two-Factor Authentication. Store them in a secure place.</p>
      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #856404; margin: 0; font-size: 14px;"><strong>⚠️ Important:</strong> Each code can only be used once. Keep them safe!</p>
      </div>
      <ul style="list-style: none; padding: 0; text-align: center;">
        ${codesList}
      </ul>
    </div>
  </div>
</body>
</html>`;
}

export function getAccountDeletedHtml(username: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Account Deleted</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333;">Hi <strong>${username}</strong>,</p>
      <p style="font-size: 16px; color: #555;">
        Your NexusURL account has been successfully deleted. All your links have been deactivated.
      </p>
      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        If you didn't request this deletion, please contact support immediately.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function getTextContent(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
