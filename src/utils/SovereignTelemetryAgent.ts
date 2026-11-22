import { Preferences } from '@capacitor/preferences';

export interface ActivityEvent {
  id: string;
  action: string;
  screen: string;
  mode: 'OFFLINE' | 'ONLINE';
  timestamp: string;
}

const TELEMETRY_KEY = 'bolmizan_sovereign_telemetry_v1';

class SovereignTelemetryAgent {
  private events: ActivityEvent[] = [];
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const res = await Preferences.get({ key: TELEMETRY_KEY });
      const raw = res.value || localStorage.getItem(TELEMETRY_KEY);
      if (raw) this.events = JSON.parse(raw);
    } catch {}
    this.track('APP_SESSION_START', window.location.hash || 'HOME');
    this.installGlobalListeners();
  }

  private installGlobalListeners(): void {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement | null)?.closest('button');
      if (btn) {
        const label = (btn.innerText || btn.title || 'BUTTON_TAP').trim().slice(0, 40);
        this.track(`TAP:${label}`, document.title || 'MIZAN_DESK');
      }
    }, true);
  }

  public async track(action: string, screen = 'MAIN'): Promise<void> {
    const ev: ActivityEvent = {
      id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      screen,
      mode: navigator.onLine ? 'ONLINE' : 'OFFLINE',
      timestamp: new Date().toISOString()
    };
    this.events = [ev, ...this.events].slice(0, 500);
    const serialized = JSON.stringify(this.events);
    try {
      localStorage.setItem(TELEMETRY_KEY, serialized);
      await Preferences.set({ key: TELEMETRY_KEY, value: serialized });
    } catch {}
  }

  public getStats() {
    const total = this.events.length;
    const offlineCount = this.events.filter((e) => e.mode === 'OFFLINE').length;
    const onlineCount = total - offlineCount;
    const topActions: Record<string, number> = {};
    for (const e of this.events) {
      topActions[e.action] = (topActions[e.action] || 0) + 1;
    }
    const sorted = Object.entries(topActions).sort((a, b) => b - a).slice(0, 5);
    return {
      totalEvents: total,
      offlineEvents: offlineCount,
      onlineEvents: onlineCount,
      offlineRatioPercent: total ? Math.round((offlineCount / total) * 100) : 100,
      topFeatures: sorted,
      recentEvents: this.events.slice(0, 12)
    };
  }
}

export const telemetryAgent = new SovereignTelemetryAgent();