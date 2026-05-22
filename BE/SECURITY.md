# 🔒 Security Policy — Nabila Art E-Commerce
**Version:** 3.0.0 | **Last Updated:** 2026-05-11

---

## Standar Keamanan yang Diterapkan

| Standar | Versi | Scope |
|---|---|---|
| **ISO/IEC 27001** | 2022 | Information Security Management |
| **NIST CSF** | 2.0 | Cybersecurity Framework |
| **CIS Controls** | v8 | Critical Security Controls |
| **PCI DSS** | v4.0 | Payment Card Data Security |

---

## ISO 27001 — Information Security Management

### Kontrol yang Diimplementasikan

| Annex A | Deskripsi | Implementasi |
|---|---|---|
| A.9.1 | Access Control Policy | JWT Auth, CORS whitelist |
| A.9.4 | System Access Control | `authMiddleware`, Bearer token |
| A.12.1 | Operational Procedures | Graceful shutdown, error handler |
| A.12.4 | Logging & Monitoring | Winston audit logger, request ID |
| A.12.6 | Technical Vulnerability Mgmt | Rate limiting, dependency audit |
| A.14.1 | Security in Dev Lifecycle | Input validation, Helmet headers |
| A.14.2 | Security in Development | Sanitized inputs, CSP headers |

---

## NIST CSF — Cybersecurity Framework

### 5 Fungsi Inti

```
IDENTIFY  → Inventarisasi aset API, dokumentasi endpoint
PROTECT   → Helmet headers, CORS, rate limiting, input validation
DETECT    → Audit logging, request ID tracing, error logging
RESPOND   → Global error handler, graceful shutdown
RECOVER   → Graceful shutdown (SIGTERM), uncaughtException handler
```

| Function | Category | Implementasi |
|---|---|---|
| PR.AC-3 | Remote Access | JWT + Bearer token |
| PR.AC-4 | Access Control | Rate limiter 3 level |
| PR.DS-2 | Data in Transit | HSTS, CORS, TLS-ready |
| DE.CM-1 | Monitoring | Winston structured logs |
| DE.AE-2 | Event Detection | Audit event catalogue |
| RS.RP-1 | Response Planning | Error handler middleware |

---

## CIS Controls v8 — Critical Security Controls

| Control | Deskripsi | Status |
|---|---|---|
| **CIS-4** | Secure Config of Assets | Env var validation saat startup |
| **CIS-5** | Account Management | JWT claims (userId, email) |
| **CIS-6** | Access Control | Rate limiter: auth 10req/15min |
| **CIS-8** | Audit Log Management | Security audit log, 1yr retention |
| **CIS-9** | Email & Web Protections | Helmet CSP, X-Frame-Options |
| **CIS-14** | Security Training | Input validation & sanitization |
| **CIS-16** | App Software Security | express-validator, bcrypt cost 12 |

---

## PCI DSS v4.0 — Payment Card Industry

| Requirement | Deskripsi | Implementasi |
|---|---|---|
| **Req 4** | Encrypt Transmission | HSTS header, TLS-ready config |
| **Req 6.3** | Secure Development | express-validator on all inputs |
| **Req 6.4** | Protect Against Attacks | Helmet XSS filter, CSP, body limit 10kb |
| **Req 8.2.1** | Unique User ID | UUID-based userId in JWT |
| **Req 8.3.4** | Login Attempt Control | authLimiter: 10 attempts/15 min |
| **Req 8.3.6** | Strong Password | bcrypt cost=12, min 8 char + simbol |
| **Req 10.2** | Audit Trail | logAudit() pada semua auth events |
| **Req 10.3** | Audit Entry Contents | IP, userId, timestamp, requestId |
| **Req 10.7** | Audit Log Retention | maxFiles: 365 hari |

---

## Arsitektur Keamanan

```
Request
   │
   ▼
[Helmet Headers]         ← CIS-9, PCI DSS Req 6.4
   │
   ▼
[CORS Whitelist]         ← ISO 27001 A.9.1
   │
   ▼
[Body Size Limit 10kb]   ← CIS-9 (DoS Prevention)
   │
   ▼
[Request ID Assign]      ← ISO 27001 A.12.4, PCI DSS Req 10.3
   │
   ▼
[Global Rate Limiter]    ← NIST PR.AC-4 (100 req/15min)
   │
   ▼
[Request Logger]         ← NIST DE.CM-1
   │
   ▼
[Route Handler]
   │
   ├── Auth Routes ──→ [authLimiter] ──→ [validateInput]  ← PCI DSS Req 8
   │
   ├── Protected Routes ──→ [authMiddleware JWT]           ← ISO 27001 A.9.4
   │
   └── Public Routes ──→ [apiLimiter] ──→ [sanitizeInput] ← CIS-14
   │
   ▼
[Audit Logger]           ← ISO 27001 A.12.4, PCI DSS Req 10
   │
   ▼
[Global Error Handler]   ← NIST RS.RP-1
```

---

## Rate Limiting Tiers

| Tier | Endpoint | Max Requests | Window |
|---|---|---|---|
| `authLimiter` | `/api/auth/*` | 10 | 15 menit |
| `apiLimiter` | `/api/products`, `/api/faqs` | 200 | 15 menit |
| `globalLimiter` | Semua routes | 100 | 15 menit |

---

## Password Policy (PCI DSS Req 8.3.6)

- Minimal **8 karakter**
- Minimal **1 huruf kapital**
- Minimal **1 angka**
- Minimal **1 simbol**
- Di-hash dengan **bcrypt cost factor 12**

---

## Audit Log Events

| Event | Severity | Trigger |
|---|---|---|
| `AUTH_LOGIN_SUCCESS` | LOW | Login berhasil |
| `AUTH_LOGIN_FAILED` | MEDIUM | Password/email salah |
| `AUTH_LOGIN_BLOCKED` | HIGH | Rate limit login terlampaui |
| `AUTH_TOKEN_INVALID` | MEDIUM | Token invalid/expired |
| `AUTHZ_UNAUTHORIZED` | MEDIUM | Akses tanpa token |
| `DATA_CREATED/UPDATED/DELETED` | LOW | Operasi CRUD |
| `SEC_RATE_LIMIT` | MEDIUM | Rate limit umum terlampaui |
| `SEC_INVALID_INPUT` | LOW | Validasi input gagal |

---

## Checklist Production Deployment

- [ ] Ganti `JWT_SECRET` dengan string acak ≥64 karakter
- [ ] Set `NODE_ENV=production`
- [ ] Aktifkan HTTPS / TLS di reverse proxy (Nginx)
- [ ] Set `ALLOWED_ORIGINS` hanya ke domain produksi
- [ ] Jalankan `npm audit` sebelum deploy
- [ ] Aktifkan database connection SSL
- [ ] Pasang firewall — hanya port 443 & 22 yang terbuka
- [ ] Rotasi JWT_SECRET setiap 90 hari (PCI DSS Req 8.6)
- [ ] Backup log ke storage terpisah (ISO 27001 A.12.4.2)
