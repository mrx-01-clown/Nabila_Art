/**
 * SECURITY HTTP HEADERS
 * ─────────────────────────────────────────────
 * ISO 27001 : A.14.1 (Security Requirements)
 * NIST CSF  : PR.DS-2 (Data in Transit Protection)
 * CIS       : Control 9 (Email & Web Browser Protections)
 * PCI DSS   : Req 6.4 (Address Common Security Vulnerabilities)
 */

import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';

/**
 * Apply all security HTTP headers to the Express app.
 * Uses Helmet.js for industry-standard header configuration.
 */
export function applySecurityHeaders(app: Express): void {

  // ── Helmet: sets 11 security headers (CIS Control 9) ─────
  app.use(
    helmet({
      // Content-Security-Policy — prevents XSS & data injection
      contentSecurityPolicy: {
        directives: {
          defaultSrc  : ["'self'"],
          scriptSrc   : ["'self'"],
          styleSrc    : ["'self'", "'unsafe-inline'"],
          imgSrc      : ["'self'", 'data:', 'https:'],
          connectSrc  : ["'self'"],
          fontSrc     : ["'self'", 'https:'],
          objectSrc   : ["'none'"],
          frameSrc    : ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      // HTTP Strict Transport Security (NIST PR.DS-2, PCI DSS Req 4)
      hsts: {
        maxAge           : 31536000, // 1 year
        includeSubDomains: true,
        preload          : true,
      },
      // Prevent MIME-type sniffing
      noSniff: true,
      // Prevent clickjacking
      frameguard: { action: 'deny' },
      // Remove X-Powered-By header (hide tech stack)
      hidePoweredBy: true,
      // Referrer policy
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // XSS Filter (legacy browsers)
      xssFilter: true,
    })
  );

  // ── CORS — restrict origins (ISO 27001 A.9.1) ─────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin(origin, callback) {
        // Allow requests with no origin (mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin ${origin} not allowed.`));
      },
      methods         : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders  : ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders  : ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining'],
      credentials     : true,
      maxAge          : 600, // 10 min preflight cache
    })
  );

  // ── Payload size limit (CIS Control 9.2, PCI DSS Req 6.4) ─
  // Limits body size to prevent denial-of-service via large payloads
}
