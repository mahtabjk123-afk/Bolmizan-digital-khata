import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });
const accountsDb = new DatabaseSync(path.join(dataDir, 'tenants.sqlite'));

accountsDb.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS merchant_accounts (
    tenant_id TEXT PRIMARY KEY,
    shop_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    pin_salt TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const DUMMY_SALT = '00112233445566778899aabbccddeeff';

function normalizePakistaniPhone(raw: string): string {
  const digits = raw.replace(/[^0-9+]/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    return '+92' + digits.slice(1);
  }
  if (digits.startsWith('923') && digits.length === 12) {
    return '+' + digits;
  }
  return digits;
}

function hashPin(pin: string, salt: string): string {
  return crypto.scryptSync(pin, salt, 32).toString('hex');
}

export function registerMerchantAccount(shopName: string, phoneNumber: string, pin: string) {
  const cleanPhone = normalizePakistaniPhone(phoneNumber);
  const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'shop';
  const tenantId = slug + '-' + cleanPhone.slice(-4) + '-' + crypto.randomBytes(2).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  const pinHash = hashPin(pin, salt);
  const createdAt = new Date().toISOString();

  const stmt = accountsDb.prepare(
    'INSERT INTO merchant_accounts (tenant_id, shop_name, phone_number, pin_salt, pin_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(tenantId, shopName.trim(), cleanPhone, salt, pinHash, createdAt);

  return { tenantId, shopName: shopName.trim(), phoneNumber: cleanPhone, createdAt };
}

export function authenticateMerchantAccount(phoneNumber: string, pin: string) {
  const cleanPhone = normalizePakistaniPhone(phoneNumber);
  const row = accountsDb
    .prepare('SELECT tenant_id, shop_name, phone_number, pin_salt, pin_hash FROM merchant_accounts WHERE phone_number = ?')
    .get(cleanPhone) as { tenant_id: string; shop_name: string; phone_number: string; pin_salt: string; pin_hash: string } | undefined;

  if (!row) {
    // Constant-time mitigation against phone enumeration
    hashPin(pin, DUMMY_SALT);
    return null;
  }

  const computed = Buffer.from(hashPin(pin, row.pin_salt), 'hex');
  const stored = Buffer.from(row.pin_hash, 'hex');
  if (computed.length !== stored.length || !crypto.timingSafeEqual(computed, stored)) {
    return null;
  }
  return { tenantId: row.tenant_id, shopName: row.shop_name, phoneNumber: row.phone_number };
}
