# BolMizan Protocol (Omega Architecture)
**Sovereign, Offline-First Cryptographic & Islamic Financial Operating System for Rural Informal Economies**

Built for agricultural markets (*Sabzi/Grain Mandis*), farmers, and traditional artisans across **Sindh, Pakistan** (Sakrand, Nawabshah, Khairpur, Hala) and emerging cash-based economies worldwide.

---

## Core Innovations (Zero-Loophole Stack)
1. **Compression-Resilient QIM Steganography (`src/utils/bolmizanOmegaCrypto.ts`):** Embeds a 64-bit HMAC-SHA256 digest across `8x8` luminance macro-blocks using Quantization Index Modulation (QIM), surviving WhatsApp/JPEG image compression.
2. **Conflict-Free Offline CRDT Mesh (`src/utils/bolmizanCrdtMesh.ts`):** Uses Hybrid Logical Clocks (HLC) and state-based CRDTs over WAL-mode SQLite for 0% conflict multi-device offline *Khata* syncing.
3. **Adversarial Anti-Scam & Forensics Shield (`src/utils/bolmizanAdversarialShield.ts`):** Multi-lingual (Sindhi/Urdu/English) fraud classifier, replay-attack reference registry, and Z-score input anomaly protection.
4. **Deterministic Integer Paisa & Islamic Finance Core (`src/utils/bolmizanMizanCore.ts`):** Zero floating-point drift (`BigInt` Paisa arithmetic) with automated *Karda*, *Ushr* (5% Nehri / 10% Barani), and *Adh-Batai* crop profit-sharing.

---

## Verified Empirical Benchmarks (`data/omega-verified-benchmarks.json`)
Reproducible locally via `node scripts/run-omega-benchmarks.mjs`:
* **Cryptographic Throughput:** `11,801 transactions/sec` (10,000 sequential HMAC-SHA256 ledger entries in `847.4 ms`)
* **WhatsApp Compression Watermark Survival:** `100.00%`
* **Floating-Point Arithmetic Drift:** `0 Paisa`
* **Offline CRDT Merge Conflict Rate:** `0%`

---

## Quick Start (Local & Offline PWA)
```bash
npm install
npm run build
npm run dev
```
Open `http://localhost:3000` in Chrome or Edge.
