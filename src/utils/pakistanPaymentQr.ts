export type PaymentRail = 'RAAST' | 'JAZZCASH' | 'EASYPAISA';

export interface PaymentQrRequest {
  rail: PaymentRail;
  merchantName: string;
  merchantCity: string;
  accountOrIban: string; // e.g. PK36SCBL0000001123456702 or 03001234567
  amountPkr: number;
  parchiReference: string;
}

export interface GeneratedPaymentSlip {
  rail: PaymentRail;
  emvPayload: string;
  displayLabel: string;
  formattedAmount: string;
  deepLinkHint: string;
}

function formatTlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generates an EMVCo-compliant QR payload string tailored for SBP Raast
 * and Pakistani mobile wallets (JazzCash / EasyPaisa).
 */
export function generatePakistanPaymentQr(req: PaymentQrRequest): GeneratedPaymentSlip {
  const cleanAccount = req.accountOrIban.replace(/\s+/g, '').toUpperCase();
  const safeName = req.merchantName.slice(0, 25).toUpperCase();
  const safeCity = req.merchantCity.slice(0, 15).toUpperCase();
  const amountStr = Math.max(0, Math.round(req.amountPkr)).toFixed(2);

  // EMVCo Merchant Presented Mode TLV tags
  const payloadFormat = formatTlv('00', '01');
  const pointOfInitiation = formatTlv('01', req.amountPkr > 0 ? '12' : '11'); // 12 = Dynamic Amount

  const railDomain =
    req.rail === 'RAAST'
      ? 'PK.GOV.SBP.RAAST'
      : req.rail === 'JAZZCASH'
      ? 'PK.COM.JAZZCASH'
      : 'PK.COM.EASYPAISA';

  const merchantAccountInfo = formatTlv(
    '26',
    formatTlv('00', railDomain) + formatTlv('01', cleanAccount)
  );

  const merchantCategory = formatTlv('52', '5499'); // Miscellaneous Food / Produce Stores
  const currencyPkr = formatTlv('53', '586'); // ISO 4217 code for PKR
  const txAmount = req.amountPkr > 0 ? formatTlv('54', amountStr) : '';
  const countryCode = formatTlv('58', 'PK');
  const merchantNameTag = formatTlv('59', safeName);
  const merchantCityTag = formatTlv('60', safeCity);
  const additionalData = formatTlv('62', formatTlv('05', req.parchiReference.slice(0, 20)));

  const rawBody =
    payloadFormat +
    pointOfInitiation +
    merchantAccountInfo +
    merchantCategory +
    currencyPkr +
    txAmount +
    countryCode +
    merchantNameTag +
    merchantCityTag +
    additionalData +
    '6304';

  const emvPayload = rawBody + computeCrc16Ccitt(rawBody);

  return {
    rail: req.rail,
    emvPayload,
    displayLabel: `${req.rail} — ${req.merchantName} (${cleanAccount})`,
    formattedAmount: `Rs. ${Math.round(req.amountPkr).toLocaleString()}`,
    deepLinkHint: `Scan via any Pakistani Banking App, Raast, JazzCash, or EasyPaisa`,
  };
}

function computeCrc16Ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
