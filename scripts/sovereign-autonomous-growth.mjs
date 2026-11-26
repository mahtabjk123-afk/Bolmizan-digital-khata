import fs from 'node:fs';
import path from 'node:path';

const LIVE_URL = 'https://bolmizan-sakrand.surge.sh';
const APK_URL = 'https://github.com';

const LOCAL_TRENDS = [
  'Sakrand & Nawabshah Sabzi Mandi Daily Rate & Karda Transparency',
  'Sindhi Voice Khata â€” Anparh Kisan & Dukandar 5-Second Digital Parchi',
  '8171 / BISP Fake SMS & JazzCash PIN Fraud Protection Alert'
];

const NATIONAL_TRENDS = [
  'Pakistan Offline Fintech Revolution â€” Zero Internet Digital Khata',
  'Sugar & Rice Mill Weighbridge Parchi Anti-Tamper QIM Seal',
  'Islamic Zero-Riba Ushr & Zakat Calculator for Pakistani Traders'
];

const INTERNATIONAL_TRENDS = [
  'Offline-First Post-Quantum Financial OS for 2.5B Unbanked Cash Economies',
  'Zero-Server-Cost Edge Computing Architecture ($0.00/User Marginal Cost)',
  'Multi-Language Rural AI (Sindhi, Urdu, Arabic, Hindi, Bengali, Swahili, English)'
];

const now = new Date();
const slotIndex = Math.floor(now.getTime() / (15 * 60 * 1000));
const localTopic = LOCAL_TRENDS[slotIndex % LOCAL_TRENDS.length];
const nationalTopic = NATIONAL_TRENDS[slotIndex % NATIONAL_TRENDS.length];
const globalTopic = INTERNATIONAL_TRENDS[slotIndex % INTERNATIONAL_TRENDS.length];

const cyclePayload = {
  engine: 'BolMizan Autonomous 15-Min AI Growth & Trend Orchestrator v1.0',
  founder: 'Mahtab (Sakrand, Sindh, Pakistan)',
  cycleSlot: slotIndex,
  generatedAtUTC: now.toISOString(),
  liveWebApp: LIVE_URL,
  signedApk: APK_URL,
  activeTrends: {
    localSakrandSindh: localTopic,
    nationalPakistan: nationalTopic,
    internationalGlobal: globalTopic
  },
  readyToPublishPack: {
    sindhiUrduShortScript: `Ø®Ø¨Ø±Ø¯Ø§Ø± ÛŒØ§ Ø®ÙˆØ´Ø®Ø¨Ø±ÙŠ! ${localTopic} â€” Ù‡Ø§Ú»ÙŠ Ø¨Ù†Ø§ Ø§Ù†Ù½Ø±Ù†ÙŠÙ½ ØµØ±Ù 5 Ø³ÙŠÚªÙ†ÚŠÙ† Û¾ Ù¾ÚªÙŠ Ù¾Ø±Ú†ÙŠ ÙºØ§Ù‡ÙŠÙˆ Û½ 8171 ÙØ±Ø§ÚŠ Ú©Ø§Ù† Ø¨Ú†Ùˆ! Ù„Ù†Úª: ${LIVE_URL}`,
    englishGlobalPost: `Built in Sakrand, Sindh: ${globalTopic}. Works 100% offline in Airplane Mode with 8x8 QIM receipt watermarking and BigInt Paisa precision. Try live in 0.5s: ${LIVE_URL}`,
    hashtags: '#BolMizan #Sakrand #Sindh #PakistanFintech #8171Alert #OfflineAI #AgriTech #ISEF2026'
  }
};

fs.mkdirSync('data', { recursive: true });
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync(path.join('data', 'autonomous-viral-feed.json'), JSON.stringify(cyclePayload, null, 2), 'utf8');

const htmlStream = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BolMizan 24/7 Autonomous Viral Stream</title>
  <style>
    body { background: #050811; color: #f8fafc; font-family: system-ui, sans-serif; padding: 20px; max-width: 720px; margin: auto; }
    .card { background: #0f172a; border: 1.5px solid #10b981; border-radius: 16px; padding: 18px; margin-bottom: 16px; }
    h1 { color: #fbbf24; font-size: 20px; margin: 0 0 6px; }
    .badge { display: inline-block; background: #064e3b; color: #6ee7b7; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    pre { background: #1e293b; padding: 12px; border-radius: 10px; white-space: pre-wrap; font-size: 13px; color: #e2e8f0; }
    a.btn { display: inline-block; background: #10b981; color: #052e16; font-weight: 900; text-decoration: none; padding: 10px 16px; border-radius: 10px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">â— 24/7 AUTONOMOUS 15-MIN AI ORCHESTRATOR LIVE</span>
    <h1>BolMizan Global & Local Trend Content Factory</h1>
    <p style="font-size:12px;color:#94a3b8;">Auto-Updated UTC: ${cyclePayload.generatedAtUTC} | Cycle #${slotIndex}</p>
    <p><strong>Local Trend (Sakrand/Sindh):</strong> ${localTopic}</p>
    <p><strong>National Trend (Pakistan):</strong> ${nationalTopic}</p>
    <p><strong>International Trend (Global):</strong> ${globalTopic}</p>
    <h3>Auto-Generated Sindhi / Urdu Viral Post & Video Script:</h3>
    <pre>${cyclePayload.readyToPublishPack.sindhiUrduShortScript}</pre>
    <h3>Auto-Generated Global Tech Post:</h3>
    <pre>${cyclePayload.readyToPublishPack.englishGlobalPost}\n\n${cyclePayload.readyToPublishPack.hashtags}</pre>
    <a class="btn" href="${LIVE_URL}">Open BolMizan App Now</a>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join('public', 'VIRAL_SOCIAL_STREAM.html'), htmlStream, 'utf8');
console.log('Autonomous 15-min viral cycle generated:', slotIndex);
