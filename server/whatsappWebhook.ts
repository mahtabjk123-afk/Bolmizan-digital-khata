import express, { Request, Response } from "express";
import crypto from "crypto";

export const whatsappRouter = express.Router();

export interface MizanTxRecord {
  id: string;
  merchantPhone: string;
  customerName: string;
  itemDetails: string;
  amount: number;
  txType: "UDHAAR" | "NAQAD" | "JAMA";
  haqProofSeal: string;
  createdAt: string;
}

export const MIZAN_APPEND_ONLY_LEDGER: MizanTxRecord[] = [];

const SAKRAND_MANDI_DICTIONARY = `
You are BolMizan AI (Mizan Protocol) for Sakrand, Sindh, Pakistan.
Understand Sindhi, Urdu, Siraiki, and English mandi terms:
- 'Mann' / 'Man' = 40 kg | 'Dhari' = 5 kg | 'Bori/Goni' = 50-100 kg
- 'Udhaar' / 'Qarz' = Credit Receivable | 'Naqad' / 'Rok' = Cash Paid
- 'Jama' / 'Wasool' = Payment Received | 'Biyana' = Advance Token
- 'Kapas/Phutti' = Cotton | 'Kanak/Gandum' = Wheat | 'Sari/Chawal' = Rice
Return ONLY 4 lines:
Customer: [Name or 'Cash Customer']
Item: [Item & Quantity]
Amount: [Digits only, e.g. 12500]
Type: [UDHAAR or NAQAD or JAMA]
`;

export function createHaqProofSeal(payload: string): string {
  return "MZ-" + crypto.createHash("sha256").update(payload).digest("hex").slice(0, 10).toUpperCase();
}

export function detectScamOrFakePayment(text: string): { isScam: boolean; reason: string } {
  const lower = text.toLowerCase();
  const redFlags = ["benazir", "ehsaas", "8171", "lottery", "inam", "prize", "otp", "pin code", "account block"];
  const matched = redFlags.find((flag) => lower.includes(flag));
  if (matched) {
    return { isScam: true, reason: `Fraud keyword detected ('${matched}'). Apna OTP/PIN kisi ko na dein.` };
  }
  return { isScam: false, reason: "Clean" };
}

export function formatUdhaarReminder(merchantName: string, customerName: string, amount: number): string {
  return (
    `🌿 *Assalam-o-Alaikum ${customerName} Bhai!*\n` +
    `*${merchantName}* ki taraf se adab ke saath yaad-dihani hai ke aapke zimme *PKR ${amount.toLocaleString()}* baqaya due hai.\n` +
    `Barah-e-karam sahulat ke mutabiq jama karwa dein. JazakAllah Khair!\n` +
    `🛡️ _Verified by BolMizan Mizan-Shield_`
  );
}

async function parseWithGemini(rawText: string): Promise<{ customer: string; item: string; amount: number; type: "UDHAAR" | "NAQAD" | "JAMA" }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackParse = () => {
    const numMatch = rawText.match(/(\d[\d,]*)/);
    const amount = numMatch && numMatch[1] ? Number(numMatch[1].replace(/,/g, "")) : 0;
    const isUdhaar = /udhaar|qarz|baki/i.test(rawText);
    const isJama = /jama|wasool|paid/i.test(rawText);
    const words = rawText.trim().split(/\s+/);
    return {
      customer: words[0] || "Gahak",
      item: rawText,
      amount,
      type: (isJama ? "JAMA" : isUdhaar ? "UDHAAR" : "NAQAD") as "UDHAAR" | "NAQAD" | "JAMA",
    };
  };

  if (!apiKey) return fallbackParse();

  try {
    const resp = await fetch(
      `https://googleapis.com{apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SAKRAND_MANDI_DICTIONARY}\n\nMessage: "${rawText}"` }] }],
        }),
      }
    );
    const data: any = await resp.json();
    const out: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!out) return fallbackParse();

    const map: Record<string, string> = {};
    out.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > -1) map[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });

    const parsedType = (map["Type"] || "NAQAD").toUpperCase();
    return {
      customer: map["Customer"] || "Gahak",
      item: map["Item"] || rawText,
      amount: Number((map["Amount"] || "0").replace(/[^\d.]/g, "")) || 0,
      type: parsedType === "UDHAAR" || parsedType === "JAMA" ? parsedType : "NAQAD",
    };
  } catch {
    return fallbackParse();
  }
}

export async function processMizanCoreMessage(sender: string, body: string): Promise<string> {
  const msg = (body || "").trim();
  const lower = msg.toLowerCase();

  if (!msg || ["salam", "assalam o alaikum", "hi", "start", "madad"].includes(lower)) {
    return (
      "🌿 *Wa Alaikum Assalam! BolMizan AI mein Khush Amdeed.*\n" +
      "1️⃣ *Parchi:* _'Ahmed ko 2 mann kanak 8000 ki udhaar di'_\n" +
      "2️⃣ *Reminder:* _'REMIND Ahmed 8000'_\n" +
      "3️⃣ *Scam Check:* Koi bhi mashkook SMS forward karein.\n" +
      "4️⃣ *Report:* _'REPORT'_"
    );
  }

  const scamCheck = detectScamOrFakePayment(msg);
  if (scamCheck.isScam) {
    return `🚨 *BOLMIZAN SCAM SHIELD ALERT!*\n${scamCheck.reason}\n🛡️ _Protected by Mizan Protocol_`;
  }

  if (lower.startsWith("remind ")) {
    const parts = msg.split(/\s+/);
    const cust = parts[1] || "Mohtaram Gahak";
    const amt = parts[2] ? Number(parts[2].replace(/,/g, "")) || 0 : 0;
    return formatUdhaarReminder("Hamari Dukaan", cust, amt);
  }

  if (lower === "report") {
    const today = new Date().toISOString().slice(0, 10);
    const myTxs = MIZAN_APPEND_ONLY_LEDGER.filter((t) => t.merchantPhone === sender && t.createdAt.startsWith(today));
    const naqad = myTxs.filter((t) => t.txType !== "UDHAAR").reduce((s, t) => s + t.amount, 0);
    const udhaar = myTxs.filter((t) => t.txType === "UDHAAR").reduce((s, t) => s + t.amount, 0);
    return `📊 *AAJ KI REPORT (${today})*\n💵 Naqad: PKR ${naqad.toLocaleString()}\n📒 Udhaar: PKR ${udhaar.toLocaleString()}\n🧾 Kul Parchiyan: ${myTxs.length}`;
  }

  const parsed = await parseWithGemini(msg);
  const createdAt = new Date().toISOString();
  const seal = createHaqProofSeal(`${sender}|${parsed.customer}|${parsed.amount}|${createdAt}`);

  MIZAN_APPEND_ONLY_LEDGER.push({
    id: seal,
    merchantPhone: sender,
    customerName: parsed.customer,
    itemDetails: parsed.item,
    amount: parsed.amount,
    txType: parsed.type,
    haqProofSeal: seal,
    createdAt,
  });

  return (
    `🧾 *BOLMIZAN DIGITAL PARCHI (MIZAN VERIFIED)*\n` +
    `👤 Gahak: *${parsed.customer}*\n` +
    `📦 Tafseel: ${parsed.item}\n` +
    `💰 Raqam: *PKR ${parsed.amount.toLocaleString()}* (${parsed.type})\n` +
    `🔐 HaqProof Seal: \`${seal}\`\n` +
    `📲 _Apni dukaan ka FREE AI Khata lagwane ke liye 'SALAM' bhejein!_`
  );
}

whatsappRouter.post("/whatsapp", async (req: Request, res: Response) => {
  const sender = req.body?.From || req.body?.from || "unknown-merchant";
  const body = req.body?.Body || req.body?.text || "";
  const reply = await processMizanCoreMessage(sender, body);
  res.type("text/plain").send(reply);
});
