const DB_NAME = 'BolMizanSovereignVault3D';
const DB_VERSION = 1;

export interface LedgerFilterQuery {
  searchText?: string;
  typeFilter?: 'ALL' | 'CASH_SALE' | 'CREDIT';
  minAmount?: number;
  maxAmount?: number;
}

class SovereignIndexedDbVault {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('ledger')) {
            const store = db.createObjectStore('ledger', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('type', 'type', { unique: false });
          }
          if (!db.objectStoreNames.contains('snapshots')) {
            db.createObjectStore('snapshots', { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
    return this.dbPromise;
  }

  public async syncFromLocalStorage(): Promise<number> {
    try {
      const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
      if (!raw) return 0;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return 0;
      const db = await this.openDb();
      const tx = db.transaction('ledger', 'readwrite');
      const store = tx.objectStore('ledger');
      for (const item of list) {
        if (item && item.id) store.put(item);
      }
      return list.length;
    } catch {
      return 0;
    }
  }

  public async queryFilteredEntries(q: LedgerFilterQuery): Promise<Record<string, unknown>[]> {
    await this.syncFromLocalStorage();
    let list: Record<string, unknown>[] = [];
    try {
      const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
      if (raw) list = JSON.parse(raw);
    } catch {}

    return list.filter((item) => {
      const amount = Number(item.amount || 0);
      if (q.typeFilter && q.typeFilter !== 'ALL' && String(item.type) !== q.typeFilter) return false;
      if (q.minAmount !== undefined && amount < q.minAmount) return false;
      if (q.maxAmount !== undefined && amount > q.maxAmount) return false;
      if (q.searchText && q.searchText.trim().length > 0) {
        const needle = q.searchText.toLowerCase();
        const hay = `${item.partyName || ''} ${item.item || ''} ${item.hash || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }
}

export const sovereignDbVault = new SovereignIndexedDbVault();
sovereignDbVault.syncFromLocalStorage();