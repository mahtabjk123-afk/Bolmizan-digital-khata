import { Preferences } from '@capacitor/preferences';

const HIGH_WATER_TIME_KEY = 'bolmizan_monotonic_clock_ms';
const SHADOW_BACKUP_KEY = 'bolmizan_shadow_mirror_v1';
const AUDIT_TOMBSTONE_KEY = 'bolmizan_immutable_tombstones_v1';

class SovereignZeroLoopholeShield {
  private lastSubmitSignature = '';
  private lastSubmitTime = 0;

  public sanitizeAmount(raw: unknown): number {
    const num = Number(raw);
    if (!Number.isFinite(num) || Number.isNaN(num) || num <= 0) return 0;
    const clamped = Math.min(num, 999999999);
    return Math.round(clamped * 100) / 100;
  }

  public sanitizeText(raw: unknown, maxLen = 120): string {
    return String(raw || '')
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLen);
  }

  public isDuplicateTap(party: string, amount: number): boolean {
    const sig = `${party.toLowerCase()}|${amount}`;
    const now = Date.now();
    if (sig === this.lastSubmitSignature && now - this.lastSubmitTime < 4000) {
      return true;
    }
    this.lastSubmitSignature = sig;
    this.lastSubmitTime = now;
    return false;
  }

  public verifyMonotonicClock(): { valid: boolean; driftDetected: boolean; timestamp: string } {
    const now = Date.now();
    let prev = 0;
    try {
      prev = Number(localStorage.getItem(HIGH_WATER_TIME_KEY) || '0');
    } catch {}
    const driftDetected = prev > 0 && now + 60000 < prev;
    if (now > prev) {
      try {
        localStorage.setItem(HIGH_WATER_TIME_KEY, String(now));
      } catch {}
    }
    return {
      valid: !driftDetected,
      driftDetected,
      timestamp: new Date(now).toISOString()
    };
  }

  public async createShadowMirror(): Promise<void> {
    try {
      const ledger = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
      if (ledger && ledger.startsWith('[')) {
        JSON.parse(ledger);
        localStorage.setItem(SHADOW_BACKUP_KEY, ledger);
        await Preferences.set({ key: SHADOW_BACKUP_KEY, value: ledger });
      }
    } catch {}
  }

  public async selfHealIfCorrupted(): Promise<boolean> {
    try {
      const mainKey = 'bolmizan_sovereign_v1_ledger_entries';
      const current = localStorage.getItem(mainKey);
      if (current) {
        JSON.parse(current);
        return false;
      }
      const res = await Preferences.get({ key: SHADOW_BACKUP_KEY });
      const shadow = res.value || localStorage.getItem(SHADOW_BACKUP_KEY);
      if (shadow) {
        JSON.parse(shadow);
        localStorage.setItem(mainKey, shadow);
        await Preferences.set({ key: mainKey, value: shadow });
        return true;
      }
    } catch {}
    return false;
  }

  public async recordAuditTombstone(action: string, details: string): Promise<void> {
    try {
      const raw = localStorage.getItem(AUDIT_TOMBSTONE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const clock = this.verifyMonotonicClock();
      list.unshift({
        id: `AUD-${Date.now()}`,
        action: this.sanitizeText(action, 60),
        details: this.sanitizeText(details, 200),
        clockTamperFlag: clock.driftDetected,
        at: clock.timestamp
      });
      const trimmed = JSON.stringify(list.slice(0, 300));
      localStorage.setItem(AUDIT_TOMBSTONE_KEY, trimmed);
      await Preferences.set({ key: AUDIT_TOMBSTONE_KEY, value: trimmed });
    } catch {}
  }
}

export const zeroLoopholeShield = new SovereignZeroLoopholeShield();

(async () => {
  await zeroLoopholeShield.selfHealIfCorrupted();
  zeroLoopholeShield.verifyMonotonicClock();
  await zeroLoopholeShield.createShadowMirror();
})();