import { registerMerchantAccount, authenticateMerchantAccount } from './merchantAccounts';
import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { solveMukasaCircularDebt, type DebtEdge } from './bolmizanFinalCore';
import { analyzeMessageForScam } from './scamClassifier';

export const unifiedBridgeRouter = Router();

const isProd = () => process.env.NODE_ENV === 'production';
const MAX_PILOT_ITEMS = 500;

function verifyControlPin(providedPin: unknown): boolean {
  const expected = process.env.SOVEREIGN_CONTROL_PIN || '';
  if (!expected || typeof providedPin !== 'string') return false;
  const a = Buffer.from(providedPin);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Guard write routes: allow authenticated session cookie OR valid x-sovereign-pin header (and local loopback in non-prod)
function requireBridgeAccess(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie || '';
  const hasSessionCookie = /(?:^|;\s*)bmz_session=[^;]+/.test(cookieHeader);
  const headerPin = req.headers['x-sovereign-pin'];

  if (hasSessionCookie || verifyControlPin(headerPin)) {
    return next();
  }

  const remoteIp = req.ip || req.socket?.remoteAddress || '';
  const isLoopback = remoteIp === '127.0.0.1' || remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1';
  if (!isProd() && isLoopback) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Valid session or Sovereign PIN required.' });
}

let pilotDeals: Array<{ id: string; title: string; amountPkr: number; status: string; createdAt: string }> = [];
let pilotMukasaEdges: DebtEdge[] = [];
let pilotWages: Array<{ id: string; worker: string; amountPkr: number; paidAt: string }> = [];

unifiedBridgeRouter.get('/api/tenant/session', (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie || '';
  const authenticated = /(?:^|;\s*)bmz_session=[^;]+/.test(cookieHeader);
  res.json({
    authenticated,
    mode: isProd() ? 'PRODUCTION_PIN_GATED' : 'PILOT_WORKSPACE',
    enrollmentEnabled: !isProd(),
  });
});

unifiedBridgeRouter.post('/api/tenant/auth', (req: Request, res: Response) => {
  const parsed = z.object({
    tenantId: z.string().min(2).max(64).regex(/^[a-zA-Z0-9_-]+$/),
    pin: z.string().min(4).max(32),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid tenant credentials.' });
  if (!verifyControlPin(parsed.data.pin)) return res.status(401).json({ error: 'Invalid PIN.' });
  return res.json({ ok: true, tenantId: parsed.data.tenantId, role: 'merchant_pilot' });
});

unifiedBridgeRouter.get('/api/sovereign/deals', (_req: Request, res: Response) => {
  return res.json({ deals: isProd() ? [] : pilotDeals });
});

unifiedBridgeRouter.post('/api/sovereign/deals', requireBridgeAccess, (req: Request, res: Response) => {
  const parsed = z.object({
    title: z.string().trim().min(1).max(120),
    amountPkr: z.number().int().positive().max(1_000_000_000),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid deal payload.' });
  const deal = { id: crypto.randomUUID(), ...parsed.data, status: 'OPEN_ZERO_RIBA', createdAt: new Date().toISOString() };
  pilotDeals = [deal, ...pilotDeals].slice(0, MAX_PILOT_ITEMS);
  return res.status(201).json({ ok: true, deal });
});

const MukasaEdgeSchema = z.object({
  from: z.string().trim().min(1).max(80),
  to: z.string().trim().min(1).max(80),
  amountPkr: z.number().positive().max(1_000_000_000),
});

unifiedBridgeRouter.post('/api/sovereign/mukasa/add', requireBridgeAccess, (req: Request, res: Response) => {
  const parsed = MukasaEdgeSchema.safeParse(req.body);
  if (!parsed.success || parsed.data.from === parsed.data.to) {
    return res.status(400).json({ error: 'Invalid Mukasa edge.' });
  }
  const edge: DebtEdge = {
    from: parsed.data.from,
    to: parsed.data.to,
    amount: Math.round(parsed.data.amountPkr * 100),
  };
  if (pilotMukasaEdges.length >= MAX_PILOT_ITEMS) {
    pilotMukasaEdges.shift();
  }
  pilotMukasaEdges.push(edge);
  return res.status(201).json({ ok: true, edgeCount: pilotMukasaEdges.length, edge });
});

unifiedBridgeRouter.post('/api/sovereign/mukasa/clear', requireBridgeAccess, (req: Request, res: Response) => {
  if (Array.isArray(req.body?.edges)) {
    const validated = z.array(
      z.object({
        from: z.string().trim().min(1).max(80),
        to: z.string().trim().min(1).max(80),
        amount: z.number().int().positive(),
      })
    ).max(MAX_PILOT_ITEMS).safeParse(req.body.edges);
    if (!validated.success) {
      return res.status(400).json({ error: 'Invalid Mukasa edges payload.' });
    }
    return res.json({ ok: true, report: solveMukasaCircularDebt(validated.data) });
  }
  return res.json({ ok: true, report: solveMukasaCircularDebt(pilotMukasaEdges) });
});

unifiedBridgeRouter.post('/api/sovereign/wages/add', requireBridgeAccess, (req: Request, res: Response) => {
  const parsed = z.object({
    worker: z.string().trim().min(1).max(80),
    amountPkr: z.number().int().positive().max(100_000_000),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid wage entry.' });
  const wage = { id: crypto.randomUUID(), worker: parsed.data.worker, amountPkr: parsed.data.amountPkr, paidAt: new Date().toISOString() };
  pilotWages = [wage, ...pilotWages].slice(0, MAX_PILOT_ITEMS);
  return res.status(201).json({ ok: true, wage });
});

unifiedBridgeRouter.post('/api/sovereign/reset', (req: Request, res: Response) => {
  if (!verifyControlPin(req.body?.pin)) return res.status(403).json({ error: 'Valid SOVEREIGN_CONTROL_PIN required.' });
  pilotDeals = [];
  pilotMukasaEdges = [];
  pilotWages = [];
  return res.json({ ok: true, resetAt: new Date().toISOString() });
});

unifiedBridgeRouter.post('/api/ai/extract-voice', requireBridgeAccess, (req: Request, res: Response) => {
  const transcript = typeof req.body?.transcript === 'string' ? req.body.transcript.trim().slice(0, 1000) : '';
  if (!transcript) return res.status(400).json({ error: 'Transcript required.' });

  const explicitAmountMatch = transcript.match(
    /(?:(?:rs\.?|pkr|rupees?|rupay|\u0631\u0648\u067e\u06d2|\u0631\u067e\u064a\u0627)\s*(\d[\d,]{0,9})|(\d[\d,]{0,9})\s*(?:rs\.?|pkr|rupees?|rupay|\u0631\u0648\u067e\u06d2|\u0631\u067e\u064a\u0627))/i
  );
  const rawNum = explicitAmountMatch?.at(1) ?? explicitAmountMatch?.at(2);
  const parsedAmount = rawNum ? Number(rawNum.replace(/,/g, '')) : null;

  return res.json({
    ok: true,
    draft: {
      customerName: transcript.split(/\s+/).slice(0, 2).join(' ') || 'Walk-in Customer',
      amountPkr: parsedAmount && Number.isSafeInteger(parsedAmount) && parsedAmount > 0 ? parsedAmount : null,
      entryType: /(wasooli|paid|jama|\u0648\u0635\u0648\u0644|\u0627\u062f\u0627)/i.test(transcript) ? 'PAYMENT_RECEIVED' : 'CREDIT_GIVEN',
      notes: transcript.slice(0, 200),
    },
    scamAlert: analyzeMessageForScam(transcript),
  });
});

unifiedBridgeRouter.post('/api/ai/mizan-advisor', requireBridgeAccess, (req: Request, res: Response) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim().slice(0, 1000) : '';
  if (!query) return res.status(400).json({ error: 'Query required.' });
  const hasRiba = /(sood|riba|interest|late fee|penalty|\u0633\u0648\u062f|\u062c\u0631\u0645\u0627\u0646\u06c1)/i.test(query);
  return res.json({
    ok: true,
    advisory: hasRiba
      ? 'BolMizan Policy: Interest (Riba) and late penalties are blocked. Use fixed-price trade or Mukasa circular debt netting.'
      : 'Keep daily udhaar entries hash-chained and send WhatsApp receipts for every transaction.',
  });
});

// Individual Merchant Self-Registration & Login (SaaS Multi-Merchant)
unifiedBridgeRouter.post('/api/merchants/register', (req: Request, res: Response) => {
  const parsed = z.object({
    shopName: z.string().trim().min(2).max(80),
    phoneNumber: z.string().trim().min(10).max(16).regex(/^[+0-9]+$/),
    pin: z.string().min(4).max(12).regex(/^[0-9]+$/),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter valid Shop Name, Phone Number, and 4-12 digit numeric PIN.' });
  try {
    const account = registerMerchantAccount(parsed.data.shopName, parsed.data.phoneNumber, parsed.data.pin);
    return res.status(201).json({ ok: true, account });
  } catch (err) {
    const msg = (err as Error).message || '';
    if (msg.includes('UNIQUE')) return res.status(409).json({ error: 'This phone number is already registered.' });
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

unifiedBridgeRouter.post('/api/merchants/login', (req: Request, res: Response) => {
  const parsed = z.object({
    phoneNumber: z.string().trim().min(10).max(16).regex(/^[+0-9]+$/),
    pin: z.string().min(4).max(12).regex(/^[0-9]+$/),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid phone number or PIN.' });
  const account = authenticateMerchantAccount(parsed.data.phoneNumber, parsed.data.pin);
  if (!account) return res.status(401).json({ error: 'Incorrect phone number or PIN.' });
  return res.json({ ok: true, account });
});
