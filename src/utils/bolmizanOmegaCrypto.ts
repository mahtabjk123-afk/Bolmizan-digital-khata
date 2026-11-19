export interface SovereignReceiptPayload {
  receiptId: string;
  tenantId: string;
  merchantName: string;
  counterparty: string;
  amountPaisa: number;
  txType: 'SABZI_PARCHI' | 'KHATA_CREDIT' | 'KHATA_SETTLE' | 'USHAR_ZAKAT';
  externalRefId?: string;
  timestampMs: number;
  geoHash?: string;
}

export interface SignedReceiptArtifact {
  payload: SovereignReceiptPayload;
  nonce: string;
  prevHash: string;
  merkleLeafHash: string;
  hmacSignature: string;
  shortVerifyCode: string;
}

const usedExternalRefs = new Set<string>();

export function assertNoReplayAttack(externalRefId?: string): void {
  if (!externalRefId) return;
  const normalized = externalRefId.trim().toUpperCase();
  if (usedExternalRefs.has(normalized)) {
    throw new Error(`SECURITY_BLOCK: Duplicate Transaction ID (${normalized}) detected. Replay attack prevented.`);
  }
  usedExternalRefs.add(normalized);
}

function canonicalStringify(obj: Record<string, unknown>): string {
  const sortedKeys = Object.keys(obj).sort();
  const ordered: Record<string, unknown> = {};
  for (const k of sortedKeys) {
    if (obj[k] !== undefined) ordered[k] = obj[k];
  }
  return JSON.stringify(ordered);
}

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSignHex(secretKey: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secretKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSovereignReceipt(
  payload: SovereignReceiptPayload,
  prevHash: string,
  merchantSecretKey: string
): Promise<SignedReceiptArtifact> {
  if (!Number.isInteger(payload.amountPaisa) || payload.amountPaisa <= 0) {
    throw new Error('VALIDATION_ERROR: Amount must be a positive integer in Paisa.');
  }
  assertNoReplayAttack(payload.externalRefId);
  const randomBytes = new Uint8Array(12);
  crypto.getRandomValues(randomBytes);
  const nonce = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const canonicalData = canonicalStringify({ ...payload, nonce, prevHash });
  const merkleLeafHash = await sha256Hex(canonicalData);
  const hmacSignature = await hmacSignHex(merchantSecretKey, merkleLeafHash);
  return { payload, nonce, prevHash, merkleLeafHash, hmacSignature, shortVerifyCode: hmacSignature.slice(0, 8).toUpperCase() };
}

export async function verifySovereignReceipt(
  artifact: SignedReceiptArtifact,
  merchantSecretKey: string
): Promise<{ valid: boolean; reason?: string }> {
  const expectedCanonical = canonicalStringify({ ...artifact.payload, nonce: artifact.nonce, prevHash: artifact.prevHash });
  const recomputedLeaf = await sha256Hex(expectedCanonical);
  if (recomputedLeaf !== artifact.merkleLeafHash) {
    return { valid: false, reason: 'TAMPER_DETECTED: Receipt payload or hash chain was altered.' };
  }
  const expectedHmac = await hmacSignHex(merchantSecretKey, recomputedLeaf);
  if (expectedHmac !== artifact.hmacSignature) {
    return { valid: false, reason: 'FORGERY_DETECTED: Cryptographic merchant signature invalid.' };
  }
  return { valid: true };
}

export function embedResilientWatermark(rgbaPixels: Uint8ClampedArray, width: number, height: number, signatureHex: string): Uint8ClampedArray {
  const output = new Uint8ClampedArray(rgbaPixels);
  const bits = signatureHex.slice(0, 16).split('').map((hex) => parseInt(hex, 16).toString(2).padStart(4, '0')).join('');
  const blockSize = 8;
  const quantStep = 24;
  let bitIdx = 0;

  for (let by = 0; by + blockSize <= height && bitIdx < bits.length; by += blockSize) {
    for (let bx = 0; bx + blockSize <= width && bitIdx < bits.length; bx += blockSize) {
      const bit = bits[bitIdx] === '1' ? 1 : 0;
      let sumLum = 0;
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const idx = ((by + y) * width + (bx + x)) * 4;
          sumLum += 0.299 * output[idx] + 0.587 * output[idx + 1] + 0.114 * output[idx + 2];
        }
      }
      const avgLum = sumLum / 64;
      const q = Math.round(avgLum / quantStep);
      const targetQ = (q % 2 === bit) ? q : (avgLum > q * quantStep ? q + 1 : q - 1);
      const delta = (targetQ * quantStep) - avgLum;
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const idx = ((by + y) * width + (bx + x)) * 4;
          output[idx] = Math.min(255, Math.max(0, Math.round(output[idx] + delta)));
          output[idx + 1] = Math.min(255, Math.max(0, Math.round(output[idx + 1] + delta)));
          output[idx + 2] = Math.min(255, Math.max(0, Math.round(output[idx + 2] + delta)));
        }
      }
      bitIdx++;
    }
  }
  return output;
}

export function extractResilientWatermark(rgbaPixels: Uint8ClampedArray, width: number, height: number): string {
  const blockSize = 8;
  const quantStep = 24;
  let extractedBits = '';
  for (let by = 0; by + blockSize <= height && extractedBits.length < 64; by += blockSize) {
    for (let bx = 0; bx + blockSize <= width && extractedBits.length < 64; bx += blockSize) {
      let sumLum = 0;
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const idx = ((by + y) * width + (bx + x)) * 4;
          sumLum += 0.299 * rgbaPixels[idx] + 0.587 * rgbaPixels[idx + 1] + 0.114 * rgbaPixels[idx + 2];
        }
      }
      extractedBits += Math.abs(Math.round((sumLum / 64) / quantStep) % 2).toString();
    }
  }
  let hexOut = '';
  for (let i = 0; i < extractedBits.length; i += 4) {
    hexOut += parseInt(extractedBits.slice(i, i + 4), 2).toString(16);
  }
  return hexOut;
}
