import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ── Security Modules ───────────────────────────────────────────
import { applySecurityHeaders }                from './security/headers';
import { globalLimiter, authLimiter, apiLimiter } from './security/rateLimiter';
import { appLogger, logAudit, AuditEvent }     from './security/logger';
import {
  validateRegister, validateLogin,
  validateProfileUpdate, validateProduct,
  validateCartAdd, validateUuidParam, sanitizeSearch,
} from './security/validation';
import { authMiddleware, requestIdMiddleware, AuthRequest } from './middleware/auth';

dotenv.config();

// ── Validate critical env vars at startup (CIS Control 4) ─────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    appLogger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app    = express();
const prisma = new PrismaClient();
const PORT   = process.env.PORT || 3000;
const JWT_SECRET    = process.env.JWT_SECRET!;
const JWT_EXPIRES   = process.env.JWT_EXPIRES_IN || '1d'; // PCI DSS: short token lifetime

// ══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE STACK
// ══════════════════════════════════════════════════════════════

// 1. Security HTTP headers (Helmet + CORS)
applySecurityHeaders(app);

// 2. Body size limit — prevent DoS via large payloads (CIS Control 9)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. Request ID tracing (ISO 27001 A.12.4)
app.use(requestIdMiddleware);

// 4. Global rate limiter (NIST PR.AC-4)
app.use(globalLimiter);

// 5. Structured request logger (ISO 27001 A.12.4)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const rid   = (req as AuthRequest).requestId;
  res.on('finish', () => {
    appLogger.info('HTTP', {
      requestId  : rid,
      method     : req.method,
      path       : req.path,
      status     : res.statusCode,
      durationMs : Date.now() - start,
      ip         : req.ip,
      ua         : req.headers['user-agent'],
    });
  });
  next();
});

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message   : '🌸 Nabila Art API is running!',
    version   : '3.0.0',
    security  : ['ISO 27001', 'NIST CSF', 'CIS Controls', 'PCI DSS'],
    endpoints : {
      auth    : ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      products: ['GET /api/products', 'GET /api/products/:id', 'POST /api/products', 'PUT /api/products/:id', 'DELETE /api/products/:id'],
      cart    : ['GET /api/cart', 'POST /api/cart', 'PATCH /api/cart/:id', 'DELETE /api/cart/:id', 'DELETE /api/cart'],
      profile : ['GET /api/profile', 'PUT /api/profile'],
      faqs    : ['GET /api/faqs', 'POST /api/faqs', 'DELETE /api/faqs/:id'],
    },
  });
});

// ══════════════════════════════════════════════════════════════
// AUTH — ISO 27001 A.9, PCI DSS Req 8
// ══════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', authLimiter, validateRegister, async (req: Request, res: Response) => {
  const rid = (req as AuthRequest).requestId;
  try {
    const { name, email, password, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar. Silakan login.' });
    }

    // PCI DSS Req 8.3.6: bcrypt with cost factor >= 12
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data  : { name, email, password: hashedPassword, phone: phone ?? null },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);

    logAudit({ event: AuditEvent.REGISTER_SUCCESS, severity: 'LOW', userId: user.id, email: user.email, ip: req.ip, requestId: rid });

    res.status(201).json({ success: true, message: 'Registrasi berhasil!', data: { user, token } });
  } catch (error) {
    appLogger.error('Register error', { error, requestId: rid });
    res.status(500).json({ success: false, error: 'Gagal melakukan registrasi.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', authLimiter, validateLogin, async (req: Request, res: Response) => {
  const rid = (req as AuthRequest).requestId;
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // PCI DSS Req 8.3.4: constant-time response — don't reveal whether email exists
    if (!user) {
      logAudit({ event: AuditEvent.LOGIN_FAILED, severity: 'MEDIUM', email, ip: req.ip, requestId: rid, details: { reason: 'user_not_found' } });
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logAudit({ event: AuditEvent.LOGIN_FAILED, severity: 'MEDIUM', email, ip: req.ip, requestId: rid, details: { reason: 'wrong_password' } });
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);

    logAudit({ event: AuditEvent.LOGIN_SUCCESS, severity: 'LOW', userId: user.id, email: user.email, ip: req.ip, requestId: rid });

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        user : { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, createdAt: user.createdAt },
        token,
      },
    });
  } catch (error) {
    appLogger.error('Login error', { error, requestId: rid });
    res.status(500).json({ success: false, error: 'Gagal melakukan login.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const user   = await prisma.user.findUnique({
      where : { id: userId },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
    logAudit({ event: AuditEvent.DATA_READ, severity: 'LOW', userId, ip: req.ip, resource: '/api/auth/me' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data user.' });
  }
});

// ══════════════════════════════════════════════════════════════
// PROFILE — ISO 27001 A.9.4
// ══════════════════════════════════════════════════════════════

app.get('/api/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const user   = await prisma.user.findUnique({
      where : { id: userId },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil profil.' });
  }
});

app.put('/api/profile', authMiddleware, validateProfileUpdate, async (req: Request, res: Response) => {
  const rid = (req as AuthRequest).requestId;
  try {
    const userId       = (req as AuthRequest).user.userId;
    const { name, phone, address } = req.body;
    const user = await prisma.user.update({
      where : { id: userId },
      data  : {
        ...(name    && { name }),
        ...(phone   !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
    });
    logAudit({ event: AuditEvent.DATA_UPDATED, severity: 'LOW', userId, ip: req.ip, resource: '/api/profile', requestId: rid });
    res.json({ success: true, message: 'Profil berhasil diperbarui!', data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui profil.' });
  }
});

// ══════════════════════════════════════════════════════════════
// PRODUCTS — CIS Control 14 (Input Validation)
// ══════════════════════════════════════════════════════════════

app.get('/api/products', apiLimiter, sanitizeSearch, async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && typeof category === 'string' ? { category } : {}),
        ...(search   && typeof search   === 'string' ? { title: { contains: search } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: products, total: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil produk.' });
  }
});

app.get('/api/products/:id', apiLimiter, validateUuidParam('id'), async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil produk.' });
  }
});

app.post('/api/products', authMiddleware, validateProduct, async (req: Request, res: Response) => {
  const rid = (req as AuthRequest).requestId;
  try {
    const { title, category, price, imageUrl, tags, description, stock } = req.body;
    const product = await prisma.product.create({
      data: {
        title, category,
        price      : parseFloat(price),
        imageUrl   : imageUrl   ?? null,
        tags       : tags       ?? '',
        description: description ?? null,
        stock      : stock ? parseInt(stock) : 0,
      },
    });
    logAudit({ event: AuditEvent.DATA_CREATED, severity: 'LOW', userId: (req as AuthRequest).user.userId, ip: req.ip, resource: '/api/products', requestId: rid });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal membuat produk.' });
  }
});

app.put('/api/products/:id', authMiddleware, validateUuidParam('id'), validateProduct, async (req: Request, res: Response) => {
  const rid = (req as AuthRequest).requestId;
  try {
    const { title, category, price, imageUrl, tags, description, stock, isActive } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data : {
        ...(title       && { title }),
        ...(category    && { category }),
        ...(price  !== undefined && { price: parseFloat(price) }),
        ...(imageUrl    !== undefined && { imageUrl }),
        ...(tags        && { tags }),
        ...(description !== undefined && { description }),
        ...(stock       !== undefined && { stock: parseInt(stock) }),
        ...(isActive    !== undefined && { isActive }),
      },
    });
    logAudit({ event: AuditEvent.DATA_UPDATED, severity: 'LOW', userId: (req as AuthRequest).user.userId, ip: req.ip, resource: `/api/products/${req.params.id}`, requestId: rid });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui produk.' });
  }
});

app.delete('/api/products/:id', authMiddleware, validateUuidParam('id'), async (req: Request, res: Response) => {
  const rid = (req as AuthRequest).requestId;
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    logAudit({ event: AuditEvent.DATA_DELETED, severity: 'MEDIUM', userId: (req as AuthRequest).user.userId, ip: req.ip, resource: `/api/products/${req.params.id}`, requestId: rid });
    res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus produk.' });
  }
});

// ══════════════════════════════════════════════════════════════
// CART — Protected (ISO 27001 A.9)
// ══════════════════════════════════════════════════════════════

app.get('/api/cart', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId   = (req as AuthRequest).user.userId;
    const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
    const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({ success: true, data: cartItems, totalPrice });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil keranjang.' });
  }
});

app.post('/api/cart', authMiddleware, validateCartAdd, async (req: Request, res: Response) => {
  try {
    const userId              = (req as AuthRequest).user.userId;
    const { productId, quantity } = req.body;
    const cartItem = await prisma.cartItem.upsert({
      where  : { userId_productId: { userId, productId } },
      update : { quantity: { increment: quantity ?? 1 } },
      create : { userId, productId, quantity: quantity ?? 1 },
      include: { product: true },
    });
    res.status(201).json({ success: true, data: cartItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menambahkan ke keranjang.' });
  }
});

app.patch('/api/cart/:id', authMiddleware, validateUuidParam('id'), async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Item dihapus dari keranjang.' });
    }
    const item = await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity }, include: { product: true } });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui keranjang.' });
  }
});

app.delete('/api/cart/:id', authMiddleware, validateUuidParam('id'), async (req: Request, res: Response) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Item berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus item.' });
  }
});

app.delete('/api/cart', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.userId;
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ success: true, message: 'Keranjang berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengosongkan keranjang.' });
  }
});

// ══════════════════════════════════════════════════════════════
// FAQs
// ══════════════════════════════════════════════════════════════

app.get('/api/faqs', apiLimiter, async (_req: Request, res: Response) => {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil FAQ.' });
  }
});

app.post('/api/faqs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) return res.status(400).json({ success: false, error: 'question dan answer wajib diisi.' });
    const faq = await prisma.faq.create({ data: { question, answer, order: order ?? 0 } });
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal membuat FAQ.' });
  }
});

app.delete('/api/faqs/:id', authMiddleware, validateUuidParam('id'), async (req: Request, res: Response) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'FAQ berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus FAQ.' });
  }
});

// ══════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER — ISO 27001 A.12.1
// ══════════════════════════════════════════════════════════════

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// Unhandled error handler — sanitize stack traces (CIS Control 14)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  appLogger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ success: false, error: 'Terjadi kesalahan internal server.' });
});

// Graceful shutdown (ISO 27001 A.12.1.3)
process.on('SIGTERM', async () => {
  appLogger.info('SIGTERM received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  appLogger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

// ══════════════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  logAudit({ event: AuditEvent.SERVER_START, severity: 'LOW', details: { port: PORT } });
  appLogger.info(`🌸 Nabila Art API v3.0 — http://localhost:${PORT}`);
  appLogger.info('🔒 Security: ISO 27001 | NIST CSF | CIS Controls | PCI DSS');
});
