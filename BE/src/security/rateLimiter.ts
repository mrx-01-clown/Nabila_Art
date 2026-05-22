/**
 * RATE LIMITER
 * ─────────────────────────────────────────────
 * ISO 27001 : A.12.6 (Technical Vulnerability Management)
 * NIST CSF  : PR.AC-4 (Access Control)
 * CIS       : Control 6 (Access Control Management)
 * PCI DSS   : Req 6.4 (Protect Against Known Attacks)
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logAudit, AuditEvent } from './logger';

const getIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
  req.ip ||
  'unknown';

// ── Global limiter: 100 req / 15 min (CIS Control 6) ─────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req: Request, res: Response) {
    logAudit({
      event: AuditEvent.RATE_LIMIT_HIT,
      severity: 'MEDIUM',
      ip: getIp(req),
      resource: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: 'Terlalu banyak permintaan. Coba lagi dalam 15 menit.',
    });
  },
});

// ── Auth limiter: 10 req / 15 min (PCI DSS Req 8.3.4) ────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req: Request, res: Response) {
    logAudit({
      event: AuditEvent.LOGIN_BLOCKED,
      severity: 'HIGH',
      ip: getIp(req),
      resource: req.path,
      details: { reason: 'rate_limit_exceeded' },
    });
    res.status(429).json({
      success: false,
      error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
    });
  },
});

// ── API limiter: 200 req / 15 min ─────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req: Request, res: Response) {
    logAudit({
      event: AuditEvent.RATE_LIMIT_HIT,
      severity: 'MEDIUM',
      ip: getIp(req),
      resource: req.path,
    });
    res.status(429).json({ success: false, error: 'Rate limit terlampaui.' });
  },
});
