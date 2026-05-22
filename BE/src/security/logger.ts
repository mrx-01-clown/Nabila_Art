/**
 * SECURITY AUDIT LOGGER
 * ─────────────────────────────────────────────
 * ISO 27001 : A.12.4 (Logging & Monitoring)
 * NIST CSF  : DE.CM-1 (Continuous Monitoring)
 * CIS       : Control 8 (Audit Log Management)
 * PCI DSS   : Req 10 (Audit Trails)
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ── Operational logger ─────────────────────────
export const appLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  defaultMeta: { service: 'nabila-art-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30,
    }),
  ],
});

// ── Security audit logger — PCI DSS Req 10.7: 1 year retention
export const auditLogger = winston.createLogger({
  level: 'info',
  format: jsonFormat,
  defaultMeta: { service: 'nabila-art-security' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security-audit.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 365,
    }),
  ],
});

// ── Event catalogue (ISO 27001 A.12.4, PCI DSS 10.2) ─────────
export enum AuditEvent {
  LOGIN_SUCCESS       = 'AUTH_LOGIN_SUCCESS',
  LOGIN_FAILED        = 'AUTH_LOGIN_FAILED',
  LOGIN_BLOCKED       = 'AUTH_LOGIN_BLOCKED',
  REGISTER_SUCCESS    = 'AUTH_REGISTER_SUCCESS',
  TOKEN_INVALID       = 'AUTH_TOKEN_INVALID',
  UNAUTHORIZED        = 'AUTHZ_UNAUTHORIZED',
  DATA_READ           = 'DATA_READ',
  DATA_CREATED        = 'DATA_CREATED',
  DATA_UPDATED        = 'DATA_UPDATED',
  DATA_DELETED        = 'DATA_DELETED',
  RATE_LIMIT_HIT      = 'SEC_RATE_LIMIT',
  INVALID_INPUT       = 'SEC_INVALID_INPUT',
  SERVER_START        = 'SYS_SERVER_START',
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditEntry {
  event     : AuditEvent;
  severity  : Severity;
  userId?   : string;
  email?    : string;
  ip?       : string;
  method?   : string;
  resource? : string;
  details?  : Record<string, unknown>;
  requestId?: string;
}

export function logAudit(entry: AuditEntry): void {
  const level = entry.severity === 'HIGH' || entry.severity === 'CRITICAL' ? 'warn' : 'info';
  auditLogger[level](entry.event, { ...entry, ts: new Date().toISOString() });
}

export default appLogger;
