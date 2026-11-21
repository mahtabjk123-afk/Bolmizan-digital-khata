import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const STORAGE_PREFIX = 'bolmizan_offline_';

async function getLocalData<T>(key: string, fallback: T): Promise<T> {
    try {
        const { value } = await Preferences.get({ key: STORAGE_PREFIX + key });
        return value ? (JSON.parse(value) as T) : fallback;
    } catch {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    }
}

async function setLocalData<T>(key: string, data: T): Promise<void> {
    const serialized = JSON.stringify(data);
    try {
        await Preferences.set({ key: STORAGE_PREFIX + key, value: serialized });
    } catch {
        localStorage.setItem(STORAGE_PREFIX + key, serialized);
    }
}

function jsonResponse(payload: unknown, status = 200): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function installOfflineAndroidBridge(): void {
    const isNative = Capacitor.isNativePlatform();
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        // Intercept all internal /api/ calls when on Android or offline
        if (url.startsWith('/api/') || url.includes('/api/')) {
            if (!isNative && navigator.onLine) {
                try {
                    const networkRes = await originalFetch(input, init);
                    if (networkRes.ok) return networkRes;
                } catch {
                    // Fall through to offline handler if server is unreachable
                }
            }

            const method = (init?.method || 'GET').toUpperCase();
            let body: Record<string, unknown> = {};
            if (init?.body && typeof init.body === 'string') {
                try {
                    body = JSON.parse(init.body);
                } catch {
                    body = {};
                }
            }

            // Route 1: Health & Sovereign Status
            if (url.includes('/health') || url.includes('/status')) {
                return jsonResponse({
                    ok: true,
                    mode: 'OFFLINE_SOVEREIGN_ANDROID',
                    platform: Capacitor.getPlatform(),
                    timestamp: new Date().toISOString()
                });
            }

            // Route 2: Ledger / Khata / Transactions
            if (url.includes('/ledger') || url.includes('/khata') || url.includes('/transactions')) {
                const entries = await getLocalData<unknown[]>('ledger_entries', []);
                if (method === 'POST') {
                    const newEntry = {
                        id: `tx_${Date.now()}`,
                        createdAt: new Date().toISOString(),
                        offlineVerified: true,
                        ...body
                    };
                    const updated = [newEntry, ...entries];
                    await setLocalData('ledger_entries', updated);
                    return jsonResponse({ ok: true, entry: newEntry, entries: updated }, 201);
                }
                return jsonResponse({ ok: true, entries, total: entries.length });
            }

            // Route 3: Tenant / Auth / Session
            if (url.includes('/auth') || url.includes('/tenant') || url.includes('/session')) {
                const defaultUser = {
                    id: 'local_merchant_sindh',
                    name: 'Sakrand Mandi Merchant',
                    role: 'SOVEREIGN_OWNER',
                    offline: true
                };
                if (method === 'POST') {
                    const user = { ...defaultUser, ...body };
                    await setLocalData('active_tenant', user);
                    return jsonResponse({ ok: true, user, token: 'offline-sovereign-token' });
                }
                const savedUser = await getLocalData('active_tenant', defaultUser);
                return jsonResponse({ ok: true, user: savedUser });
            }

            // Route 4: Scam & Fraud Detection (Local Heuristic Engine)
            if (url.includes('/scam') || url.includes('/fraud') || url.includes('/shield')) {
                const text = String(body.text || body.message || '').toLowerCase();
                const redFlags = ['otp', 'pin', 'benazir', 'bisp', 'prize', 'inaam', 'urgent', 'block', 'jazzcash pin', 'easypaisa code'];
                const matched = redFlags.filter((flag) => text.includes(flag));
                const isScam = matched.length > 0;
                return jsonResponse({
                    ok: true,
                    isScam,
                    riskScore: isScam ? Math.min(98, 65 + matched.length * 15) : 4,
                    reasons: isScam ? [`Detected high-risk keywords: ${matched.join(', ')}`] : ['No offline fraud patterns detected'],
                    engine: 'BOLMIZAN_EDGE_SHIELD_V1'
                });
            }

            // Default Fallback for any other /api/ route
            return jsonResponse({
                ok: true,
                offline: true,
                message: 'Handled locally by BolMizan Offline Sovereign Bridge',
                data: body
            });
        }

        return originalFetch(input, init);
    };
}
