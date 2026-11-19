export interface ThreatAssessment {
  riskScore: number;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'BLOCKED_SCAM';
  reasons: string[];
}

const SCAM_FEATURES: Array<{ pattern: RegExp; weight: number; label: string }> = [
  { pattern: /\b(bisp|benazir|ehsaas|8171)\b/i, weight: 40, label: 'Fake BISP/8171 welfare lure' },
  { pattern: /\b(pin|otp|mpin|password|code\s*bata)\b/i, weight: 55, label: 'Credential/OTP harvesting attempt' },
  { pattern: /\b(jeeto|inaam|lottery|lucky\s*draw|qismat)\b/i, weight: 45, label: 'Prize/lottery social engineering' },
  { pattern: /\b(urgent|foran|block\s*ho\s*jayega|band\s*ho\s*jayega)\b/i, weight: 35, label: 'Artificial urgency threat' },
  { pattern: /(?:bit\.ly|tinyurl|ngrok|\.xyz|\.top|\.click)/i, weight: 50, label: 'Suspicious shortened URL' },
  { pattern: /\b(galti\s*se\s*send|wapas\s*bhej\s*dein|bhool\s*se\s*aa\s*gaye)\b/i, weight: 45, label: 'Reverse-refund fake SMS scam' },
];

export function analyzeMessageForScam(text: string, senderId?: string): ThreatAssessment {
  let score = 0;
  const reasons: string[] = [];
  for (const feat of SCAM_FEATURES) {
    if (feat.pattern.test(text)) {
      score += feat.weight;
      reasons.push(feat.label);
    }
  }
  if (senderId && /^(\+92|03)\d{9}$/.test(senderId.replace(/[\s-]/g, ''))) {
    if (/\b(easypaisa|jazzcash|raast|sbp|bank|8171)\b/i.test(text)) {
      score += 65;
      reasons.push('Spoofed bank/wallet alert from personal mobile (+92/03xx)');
    }
  }
  const clamped = Math.min(100, score);
  const verdict = clamped >= 60 ? 'BLOCKED_SCAM' : clamped >= 30 ? 'SUSPICIOUS' : 'SAFE';
  return { riskScore: clamped, verdict, reasons };
}

export function detectAmountAnomaly(amountPaisa: number, historicalAmountsPaisa: number[]): ThreatAssessment {
  if (historicalAmountsPaisa.length < 5) return { riskScore: 0, verdict: 'SAFE', reasons: [] };
  const mean = historicalAmountsPaisa.reduce((a, b) => a + b, 0) / historicalAmountsPaisa.length;
  const variance = historicalAmountsPaisa.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalAmountsPaisa.length;
  const stdDev = Math.sqrt(variance) || 1;
  const zScore = (amountPaisa - mean) / stdDev;
  if (zScore > 4.0 && amountPaisa > mean * 3) {
    return { riskScore: 75, verdict: 'SUSPICIOUS', reasons: [`Amount is ${(amountPaisa / mean).toFixed(1)}x higher than average (Z-Score: ${zScore.toFixed(1)}).`] };
  }
  return { riskScore: 0, verdict: 'SAFE', reasons: [] };
}
