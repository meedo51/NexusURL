# NexusURL

A production-ready URL shortening service with user authentication, link management, analytics, QR codes, and public API capabilities.

## Architecture

- **Frontend:** React 18 + TypeScript + TailwindCSS + Recharts
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Containerization:** Docker + Docker Compose

## Quick Start

```bash
# Clone and start all services
docker-compose up --build

# Access the application
Frontend: http://187.77.183.14:1590
Backend API: http://187.77.183.14:7658
Public API: http://187.77.183.14:1156
```

## Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 1590 | Web UI |
| Backend API | 7658 | REST API |
| Public API | 1156 | External API |
| PostgreSQL | 7002 | Database (internal only) |
| Short Domain | xus.me | Clean short URLs |

## Features

- **User Authentication:** Signup, signin, JWT tokens, refresh tokens, session management
- **Two-Factor Authentication:** TOTP-based 2FA with backup codes
- **URL Shortening:** Custom aliases, password protection, expiration dates, one-time access
- **Analytics:** Click tracking, unique visitors, device/browser/country stats, time-series charts
- **QR Code Generation:** Dynamic QR codes for each short link
- **Email Notifications:** Welcome emails, password reset, link visit alerts
- **Public API:** Create short links via simple GET requests
- **Profile Management:** Edit profile, change password, preferences, API key management

## API Documentation

### Authentication

```
POST /api/auth/signup     - Create account
POST /api/auth/signin     - Sign in
POST /api/auth/logout     - Sign out (blacklists token)
POST /api/auth/refresh    - Refresh JWT token
POST /api/auth/2fa/setup  - Setup 2FA (returns QR code)
POST /api/auth/2fa/verify - Verify and enable 2FA
POST /api/auth/2fa/disable - Disable 2FA
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password  - Reset password
```

### Links

```
POST   /api/links              - Create short link
GET    /api/links              - List user links (paginated)
DELETE /api/links/:id          - Delete link
PUT    /api/links/:id/password - Set/remove password
PUT    /api/links/:id/expiration - Set/remove expiration
GET    /api/links/:id/stats    - Get link statistics
GET    /api/links/check-alias/:alias - Check alias availability
```

### User Profile

```
GET    /api/user/profile        - Get profile
PUT    /api/user/profile        - Update profile
PUT    /api/user/security/password - Change password
PUT    /api/user/security/username  - Change username
PUT    /api/user/preferences    - Update preferences
GET    /api/user/api-key        - Get API key
POST   /api/user/api-key/regenerate - Regenerate API key
GET    /api/user/sessions       - List active sessions
DELETE /api/user/sessions/:id   - Terminate session
DELETE /api/user/account        - Delete account
```

### Public API

```
GET /api/public/create?act=ct&l=<url>&ca=<alias>&pwd=<password>&exp=<date>&acp=<0|1>
```

### QR Code

```
GET /api/qr/:shortCode?size=<100-1000>
```

### Health Check

```
GET /health
```

## Environment Variables

Copy `.env.production` to `.env` and configure:
```
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_PASS=your_smtp_password
```

## Deployment

```bash
# Production deployment
docker-compose up -d --build

# Monitor logs
docker-compose logs -f

# Stop services
docker-compose down
```
