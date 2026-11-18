// BolMizan Edge Resilience & Adversarial Hardening Module (Closes Audit Points 101-150)

// #124: Strip invisible Unicode zero-width characters & Urdu/Arabic diacritics (zer-zabar)
export function stripAdversarialUnicode(input: string): string {
  return input
    .replace(/[\u200B-\u200F\uFEFF\u064B-\u065F\u0670]/g, '')
    .normalize('NFKC')
    .trim();
}

// #113, #114, #119: Negation-Aware, Self-Correcting & Sindh Regional Unit Parser
export function parseVernacularMandiSpeech(rawSpeech: string) {
  const clean = stripAdversarialUnicode(rawSpeech.toLowerCase());

  // #113: Handle human self-corrections ("500 nahi 400 likho" -> picks final corrected number 400)
  const correctionMatch = clean.match(/\d+\s*(?:nahi|na|balkay|actually)\s*(\d+)/);
  const allNumbers = clean.match(/\d+/g);
  const resolvedNumber = correctionMatch
    ? Number(correctionMatch[1])
    : allNumbers
    ? Number(allNumbers[allNumbers.length - 1])
    : 1;

  // #114: Regional Sindh Mandi Units -> Standard Kilograms
  let unit = 'KG';
  let weightKg = resolvedNumber;
  if (/\b(mann|man|maund)\b/.test(clean)) {
    unit = 'MANN (40kg)';
    weightKg = resolvedNumber * 40;
  } else if (/\b(dhari)\b/.test(clean)) {
    unit = 'DHARI (5kg)';
    weightKg = resolvedNumber * 5;
  } else if (/\b(ser|seer)\b/.test(clean)) {
    unit = 'SER (0.93kg)';
    weightKg = Number((resolvedNumber * 0.933).toFixed(2));
  } else if (/\b(pao)\b/.test(clean)) {
    unit = 'PAO (0.25kg)';
    weightKg = resolvedNumber * 0.25;
  }

  // #119: Negation Blindness Protection ("udhaar wapas nahi mila" vs "wapas mila")
  const hasNegation = /\b(nahi|na|mat|not|konhe|nathi)\b/.test(clean);
  const isRepayment = /\b(wapas|vasool|ada|mila|received)\b/.test(clean) && !hasNegation;

  return {
    resolvedNumber,
    unit,
    weightKg,
    entryDirection: isRepayment ? 'CASH_RECEIVED_SETTLEMENT' : 'UDHAAR_CREDIT_GIVEN',
    negationDetected: hasNegation,
  };
}

// #130: Exponential Backoff Brute-Force PIN Lockout Guard
const failedPinAttempts = new Map<string, { count: number; lockUntilMs: number }>();

export function checkPinRateLimit(terminalId: string): { allowed: boolean; waitSec: number } {
  const rec = failedPinAttempts.get(terminalId);
  if (rec && Date.now() < rec.lockUntilMs) {
    return { allowed: false, waitSec: Math.ceil((rec.lockUntilMs - Date.now()) / 1000) };
  }
  return { allowed: true, waitSec: 0 };
}

export function recordPinAttempt(terminalId: string, success: boolean): void {
  if (success) {
    failedPinAttempts.delete(terminalId);
    return;
  }
  const prev = failedPinAttempts.get(terminalId)?.count || 0;
  const next = prev + 1;
  const backoffMs = next >= 3 ? Math.pow(2, next - 2) * 15000 : 0; // 15s, 30s, 60s...
  failedPinAttempts.set(terminalId, { count: next, lockUntilMs: Date.now() + backoffMs });
}

// #148: 58mm Bluetooth Thermal Printer (ESC/POS Plain-Text Layout)
export function formatThermal58mmReceipt(tx: {
  txId: string;
  shopName: string;
  customer: string;
  item: string;
  amountPkr: number;
  shortHash: string;
}): string {
  return [
    '================================',
    `       ${tx.shopName.toUpperCase()}`,
    '   BOLMIZAN VERIFIED PARCHI',
    '================================',
    `ID   : ${tx.txId}`,
    `CUST : ${tx.customer}`,
    `ITEM : ${tx.item}`,
    `TOTAL: PKR ${tx.amountPkr.toLocaleString()}`,
    `SEAL : ${tx.shortHash}`,
    '--------------------------------',
    '  Quran 2:282 Written Record',
    '================================',
  ].join('\n');
}
