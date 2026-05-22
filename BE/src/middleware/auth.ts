/**
 * AUTHENTICATION MIDDLEWARE
 * ─────────────────────────────────────────────
 * ISO 27001 : A.9.4 (System & Application Access Control)
 * NIST CSF  : PR.AC-3 (Remote Access Management)
 * CIS       : Control 6 (Access Control Management)
 * PCI DSS   : Req 8 (Identify & Authenticate Users)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logAudit, AuditEvent } from '../security/logger';

export interface AuthPayload {
  userId: string;
  email : string;
  iat   : number;
  exp   : number;
}

export interface AuthRequest extends Request {
  user     : AuthPayload;
  requestId: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Verify JWT token on every protected route.
 * PCI DSS Req 8.2.1: Unique ID for each user.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as AuthRequest).requestId || 'N/A';
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    logAudit({
      event    : AuditEvent.UNAUTHORIZED,
      severity : 'MEDIUM',
      ip       : req.ip,
      resource : req.path,
      method   : req.method,
      requestId,
      details  : { reason: 'missing_token' },
    });
    return res.status(401).json({ success: false, error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (err: any) {
    const isExpired = err?.name === 'TokenExpiredError';
    logAudit({
      event    : isExpired ? AuditEvent.TOKEN_INVALID : AuditEvent.TOKEN_INVALID,
      severity : 'MEDIUM',
      ip       : req.ip,
      resource : req.path,
      requestId,
      details  : { reason: isExpired ? 'token_expired' : 'token_invalid' },
    });
    return res.status(401).json({
      success: false,
      error  : isExpired ? 'Token sudah kadaluarsa. Silakan login ulang.' : 'Token tidak valid.',
    });
  }
};

/**
 * Request ID middleware — traceability (ISO 27001 A.12.4, PCI DSS Req 10.3)
 * Attaches a unique request ID to every request for log correlation.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  (req as AuthRequest).requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};
