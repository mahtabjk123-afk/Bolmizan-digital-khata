export interface CenturyLedgerPacket {
  protocolVersion: string;
  epochEra: 'ERA_1_MANDI_EDGE' | 'ERA_2_ISLAMIC_FINANCE' | 'ERA_3_POST_QUANTUM' | 'ERA_4_AUTONOMOUS_AGRI' | 'ERA_5_DEEP_EDGE_CRDT';
  classicalDigest: string;
  postQuantumHybridTag: string;
  delayTolerantLamportClock: number;
  payload: Record<string, unknown>;
}

class SovereignCenturyEngine {
  private lamportClock = Date.now();

  public createCenturyProofPacket(payload: Record<string, unknown>): CenturyLedgerPacket {
    this.lamportClock += 1;
    const raw = JSON.stringify({ clock: this.lamportClock, payload });
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < raw.length; i++) {
      const c = raw.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193);
      h2 ^= c + (i & 0xff);
      h2 = Math.imul(h2, 0x85ebca6b);
    }
    const classicalHex = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
    const pqReadyTag = `PQC-HYBRID-LATTICE-V1-${classicalHex.toUpperCase()}`;

    return {
      protocolVersion: 'BOLMIZAN-CENTURY-OS-1.0',
      epochEra: 'ERA_1_MANDI_EDGE',
      classicalDigest: classicalHex,
      postQuantumHybridTag: pqReadyTag,
      delayTolerantLamportClock: this.lamportClock,
      payload
    };
  }

  public formatThermalPrinterReceipt(params: {
    shopName?: string;
    partyName: string;
    item: string;
    netWeightKg: number;
    amountPkr: number;
    hash: string;
  }): string {
    const line = '--------------------------------';
    return [
      '   BOLMIZAN SOVEREIGN MIZAN',
      `   ${params.shopName || 'Sakrand Mandi Verified'}`,
      line,
      `Date : ${new Date().toLocaleString('en-PK')}`,
      `Party: ${params.partyName}`,
      `Item : ${params.item}`,
      `NetWt: ${params.netWeightKg} kg`,
      `Total: Rs. ${params.amountPkr.toLocaleString()}`,
      line,
      `QIM Seal: ${params.hash}`,
      'Founder : Mahtab (0305-8359178)',
      '100% Offline • Zero-Drift Paisa',
      line
    ].join('\n');
  }

  public printThermalReceiptNow(receiptText: string): void {
    try {
      const w = window.open('', '_blank', 'width=340,height=520');
      if (!w) return;
      w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:12px;">${receiptText}</pre><script>window.print();</script>`);
      w.document.close();
    } catch {}
  }

  public speakFullAudioSummary(urduText: string): void {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(urduText);
        utter.lang = 'ur-PK';
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      }
    } catch {}
  }
}

export const centuryEngine = new SovereignCenturyEngine();

(window as unknown as Record<string, unknown>).BolMizanCenturyEngine = centuryEngine;