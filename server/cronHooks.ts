import { MIZAN_APPEND_ONLY_LEDGER } from "./whatsappWebhook";

export function generateDaily9PMReportSummary() {
  const today = new Date().toISOString().slice(0, 10);
  const todaysTxs = MIZAN_APPEND_ONLY_LEDGER.filter((t) => t.createdAt.startsWith(today));

  const byMerchant: Record<string, { naqad: number; udhaar: number; count: number }> = {};
  for (const tx of todaysTxs) {
    if (!byMerchant[tx.merchantPhone]) {
      byMerchant[tx.merchantPhone] = { naqad: 0, udhaar: 0, count: 0 };
    }
    byMerchant[tx.merchantPhone].count += 1;
    if (tx.txType === "UDHAAR") byMerchant[tx.merchantPhone].udhaar += tx.amount;
    else byMerchant[tx.merchantPhone].naqad += tx.amount;
  }
  return { date: today, totalMerchantsActive: Object.keys(byMerchant).length, summary: byMerchant };
}

export function startMizanAutomationHooks() {
  // Check every 60 seconds if it is 21:00 (9:00 PM PKT)
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 21 && now.getMinutes() === 0) {
      const report = generateDaily9PMReportSummary();
      console.log("[BolMizan 9PM Munafa Hook]", JSON.stringify(report));
    }
  }, 60_000);
}
