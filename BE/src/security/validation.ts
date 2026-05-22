/**
 * INPUT VALIDATION & SANITIZATION
 * ─────────────────────────────────────────────
 * ISO 27001 : A.14.2 (Security in Development)
 * NIST CSF  : PR.DS-2 (Data-in-Transit Protection)
 * CIS       : Control 14 (Security Awareness & Training)
 * PCI DSS   : Req 6.3 (Develop Secure Applications)
 */

import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logAudit, AuditEvent } from './logger';

// ── Validation error handler ───────────────────
export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logAudit({
      event: AuditEvent.INVALID_INPUT,
      severity: 'LOW',
      ip: req.ip,
      resource: req.path,
      method: req.method,
      details: { errors: errors.array() },
    });
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// ── Register validation ────────────────────────
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama 2–100 karakter.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')        // PCI DSS Req 8.3.6
    .matches(/[A-Z]/).withMessage('Password harus ada huruf kapital.')
    .matches(/[0-9]/).withMessage('Password harus ada angka.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password harus ada simbol.'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('id-ID').withMessage('Nomor HP tidak valid.'),
  handleValidation,
];

// ── Login validation ───────────────────────────
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.'),
  handleValidation,
];

// ── Profile update validation ──────────────────
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nama 2–100 karakter.')
    .escape(),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('id-ID').withMessage('Nomor HP tidak valid.'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Alamat maks 500 karakter.')
    .escape(),
  handleValidation,
];

// ── Product validation ─────────────────────────
export const validateProduct = [
  body('title')
    .trim()
    .notEmpty().withMessage('Judul produk wajib diisi.')
    .isLength({ min: 2, max: 200 }).withMessage('Judul 2–200 karakter.')
    .escape(),
  body('category')
    .trim()
    .notEmpty().withMessage('Kategori wajib diisi.')
    .escape(),
  body('price')
    .notEmpty().withMessage('Harga wajib diisi.')
    .isFloat({ min: 0 }).withMessage('Harga harus angka positif.'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok harus angka non-negatif.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Deskripsi maks 2000 karakter.')
    .escape(),
  handleValidation,
];

// ── Cart validation ────────────────────────────
export const validateCartAdd = [
  body('productId')
    .trim()
    .notEmpty().withMessage('productId wajib diisi.')
    .isUUID().withMessage('productId tidak valid.'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Quantity 1–100.'),
  handleValidation,
];

// ── UUID param validation ──────────────────────
export const validateUuidParam = (paramName: string) => [
  param(paramName).isUUID().withMessage(`${paramName} tidak valid.`),
  handleValidation,
];

// ── Search query sanitization (CIS Control 14) ─
export const sanitizeSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Query pencarian maks 100 karakter.')
    .escape(),
  query('category')
    .optional()
    .trim()
    .escape(),
  handleValidation,
];
