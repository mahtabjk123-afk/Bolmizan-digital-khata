export interface ParchiPayload {
  merchantName: string;
  customerName: string;
  itemsSummary: string;
  totalAmountPKR: number;
  isRibaFree: boolean;
  stegoSignatureHash: string;
  timestamp: string;
}

export function generateViralWhatsAppLink(
  customerPhone: string,
  payload: ParchiPayload,
  appBaseUrl: string = "https://bolmizan.app"
): string {
  const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0")
    ? "92" + cleanPhone.slice(1)
    : cleanPhone;

  const verifyUrl = `${appBaseUrl}/?verify=${encodeURIComponent(payload.stegoSignatureHash)}`;

  const message = [
    `⚖️ *BOLMIZAN VERIFIED DIGITAL PARCHI*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🏪 *Tajir:* ${payload.merchantName}`,
    `👤 *Gahak:* ${payload.customerName}`,
    `📦 *Tafseel:* ${payload.itemsSummary}`,
    `💰 *Kul Raqam:* Rs. ${payload.totalAmountPKR.toLocaleString()}`,
    `🕌 *Status:* ${payload.isRibaFree ? "100% Riba-Free (Halal)" : "Standard"}`,
    `🔐 *Stego-Hash:* \`${payload.stegoSignatureHash.slice(0, 12)}...\``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛡️ *Tamper-Proof Verification:*`,
    `Is parchi ki asliyat check karne ya apna *Free Halal Voice Khata* kholne ke liye neeche click karein:`,
    `👉 ${verifyUrl}`,
  ].join("\n");

  return `https://wa.me{formattedPhone}?text=${encodeURIComponent(message)}`;
}
