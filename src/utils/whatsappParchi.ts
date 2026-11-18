export interface ParchiLineItem {
  name: string;
  weightKg: number;
  ratePerKg: number;
}

export interface SabziParchiPayload {
  parchiId: string;
  mandiName: string;
  traderName: string;
  customerName: string;
  customerPhone?: string;
  items: ParchiLineItem[];
  mznHashTag?: string;
  isPaid: boolean;
}

export function buildWhatsAppParchiMessage(payload: SabziParchiPayload): string {
  const dateStr = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let grandTotal = 0;
  const itemLines = payload.items.map((item, idx) => {
    const lineTotal = Math.round(item.weightKg * item.ratePerKg);
    grandTotal += lineTotal;
    return `${idx + 1}. *${item.name}* — ${item.weightKg} kg × Rs.${item.ratePerKg} = *Rs.${lineTotal.toLocaleString()}*`;
  });

  const statusText = payload.isPaid ? '✅ ADA SHUDA (PAID)' : '⏳ UDHAAR KHATA (PENDING)';
  const tagLine = payload.mznHashTag ? `\n🔐 *HaqProof Seal:* ${payload.mznHashTag}` : '';

  return [
    `🥬 *BOLMIZAN DIGITAL SABZI PARCHI*`,
    `📍 *Mandi:* ${payload.mandiName}`,
    `🧾 *Parchi #:* ${payload.parchiId} | 📅 ${dateStr}`,
    `👤 *Aarhti/Shop:* ${payload.traderName}`,
    `🤝 *Customer/Kisan:* ${payload.customerName}`,
    `--------------------------------`,
    ...itemLines,
    `--------------------------------`,
    `💰 *KUL RAQAM (TOTAL): Rs.${grandTotal.toLocaleString()}*`,
    `📌 *Status:* ${statusText}${tagLine}`,
    `_Verified by BolMizan Sovereign OS_`,
  ].join('\n');
}

export function openWhatsAppParchiShare(payload: SabziParchiPayload): void {
  const message = buildWhatsAppParchiMessage(payload);
  const encodedText = encodeURIComponent(message);

  // Clean Pakistani phone number format (e.g., 03001234567 -> 923001234567)
  let cleanPhone = (payload.customerPhone || '').replace(/\D/g, '');
  if (cleanPhone.startsWith('03') && cleanPhone.length === 11) {
    cleanPhone = '92' + cleanPhone.slice(1);
  }

  const waUrl = cleanPhone
    ? `https://wa.me{cleanPhone}?text=${encodedText}`
    : `https://wa.me{encodedText}`;

  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
