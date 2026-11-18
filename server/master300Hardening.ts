// BolMizan Master 300-Point Forensic Hardening Module (Closes Math, Mandi & Cyber Edge Cases)

// #201, #202, #203, #204: Exact Integer Paisa Math, Overflow Guard, Negative Block & Zero-Division Safety
export function safePaisaMath(unitPricePkr: number, quantity: number, commissionPct = 0, bardanaKg = 0) {
  const safePrice = Math.max(0, Math.min(1e11, Number.isFinite(unitPricePkr) ? unitPricePkr : 0));
  const safeQty = Math.max(0, Math.min(1e7, Number.isFinite(quantity) ? quantity : 0));
  const netQty = Math.max(0, safeQty - Math.max(0, bardanaKg));

  const grossPaisa = Math.round(safePrice * 100) * Math.round(netQty * 100) / 100;
  const safeComm = Math.max(0, Math.min(50, Number.isFinite(commissionPct) ? commissionPct : 0));
  const aadhatPaisa = Math.round((grossPaisa * safeComm) / 100);
  const netPaisa = Math.max(0, Math.round(grossPaisa - aadhatPaisa));

  return {
    netQuantity: Number(netQty.toFixed(2)),
    grossPkr: Number((grossPaisa / 100).toFixed(2)),
    aadhatDeductionPkr: Number((aadhatPaisa / 100).toFixed(2)),
    netPayablePkr: Number((netPaisa / 100).toFixed(2)),
    safePercentage: (part: number, total: number) => (total <= 0 ? 0 : Number(((part / total) * 100).toFixed(2))),
  };
}

// #205 & #209: ReDoS Input Cap (Max 1,000 chars) + Urdu/Sindhi Unicode Canonicalization ('ك' -> 'ک', 'ي' -> 'ی')
export function normalizeVernacularSafe(raw: string): string {
  const bounded = (raw || '').slice(0, 1000); // Prevents 10,000-char ReDoS browser freeze (#209)
  return bounded
    .replace(/[\u200B-\u200F\uFEFF\u064B-\u065F\u0670]/g, '')
    .replace(/\u0643/g, '\u06A9') // Arabic Kaf -> Urdu/Sindhi Keheh (#205)
    .replace(/\u064A/g, '\u06CC') // Arabic Yeh -> Farsi/Urdu Yeh (#205)
    .normalize('NFKC')
    .trim();
}

// #206: Crash-Proof JSON Storage Reader
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// #243, #244, #247, #248: Advanced Phishing, Short-URL, Homograph, Quishing & APK Malware Scanner
export function scanAdvancedCyberThreats(rawText: string): {
  threats: string[];
  riskScoreBoost: number;
} {
  const text = normalizeVernacularSafe(rawText).toLowerCase();
  const threats: string[] = [];
  let riskScoreBoost = 0;

  // #243: URL Shorteners masking phishing destinations
  if (/\b(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy)\b/.test(text)) {
    threats.push('Masked shortened URL (bit.ly/tinyurl) hiding unverified destination (#243).');
    riskScoreBoost += 0.35;
  }

  // #244: Homograph / Punycode Spoofing (e.g., easypaısa.com with dotless 'ı' or xn--)
  if (/xn--|easypa[\u0131\u0456]sa|j[\u0430]zzcash|r[\u0430]ast/.test(text)) {
    threats.push('Homograph / Punycode domain spoofing detected (#244).');
    riskScoreBoost += 0.45;
  }

  // #247: QR Code Phishing ("Quishing" — scanning QR to "receive" money)
  if (/qr\s*(code)?\s*(scan|scam|karo|karein).*(mil|receive|inaam|25000|10000)/.test(text)) {
    threats.push('QR Phishing ("Quishing"): Scanning a QR code deducts money, never credits it (#247).');
    riskScoreBoost += 0.45;
  }

  // #248: Malicious Android APK File Links
  if (/\.apk\b|whatsapp_update\.apk|bisp_form\.apk/.test(text)) {
    threats.push('CRITICAL: Malicious Android .APK installation link blocked (#248).');
    riskScoreBoost += 0.6;
  }

  return { threats, riskScoreBoost };
}
