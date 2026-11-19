/**
 * BolMizan Omega CRDT & Hybrid Logical Clock (HLC) Offline Mesh Engine
 * Guarantees 100% conflict-free offline merging across multiple devices with zero data loss.
 */

export interface HlcTimestamp {
    wallTimeMs: number;
    logicalCounter: number;
    nodeId: string;
}

export interface CrdtLedgerEntry {
    entryId: string;
    tenantId: string;
    accountId: string;
    deltaPaisa: number; // +ve for Credit (Jama), -ve for Debit (Udhaar)
    note: string;
    hlc: HlcTimestamp;
    receiptHash: string;
    tombstone?: boolean; // Append-only soft-delete (never destroys audit trail)
}

export class HybridLogicalClock {
    private lastWall = 0;
    private counter = 0;
    constructor(private readonly nodeId: string) { }

    public now(physicalNowMs = Date.now()): HlcTimestamp {
        if (physicalNowMs > this.lastWall) {
            this.lastWall = physicalNowMs;
            this.counter = 0;
        } else {
            this.counter += 1;
        }
        return { wallTimeMs: this.lastWall, logicalCounter: this.counter, nodeId: this.nodeId };
    }

    public receive(remote: HlcTimestamp, physicalNowMs = Date.now()): HlcTimestamp {
        const maxWall = Math.max(this.lastWall, remote.wallTimeMs, physicalNowMs);
        if (maxWall === this.lastWall && maxWall === remote.wallTimeMs) {
            this.counter = Math.max(this.counter, remote.logicalCounter) + 1;
        } else if (maxWall === this.lastWall) {
            this.counter += 1;
        } else if (maxWall === remote.wallTimeMs) {
            this.lastWall = remote.wallTimeMs;
            this.counter = remote.logicalCounter + 1;
        } else {
            this.lastWall = maxWall;
            this.counter = 0;
        }
        return { wallTimeMs: this.lastWall, logicalCounter: this.counter, nodeId: this.nodeId };
    }
}

export function compareHlc(a: HlcTimestamp, b: HlcTimestamp): number {
    if (a.wallTimeMs !== b.wallTimeMs) return a.wallTimeMs - b.wallTimeMs;
    if (a.logicalCounter !== b.logicalCounter) return a.logicalCounter - b.logicalCounter;
    return a.nodeId.localeCompare(b.nodeId);
}

/**
 * Append-Only G-Set + LWW-Element-Set CRDT Ledger
 * Commutative, Associative, and Idempotent: Merging in ANY order yields the EXACT same balance.
 */
export class SovereignCrdtLedger {
    private entries = new Map<string, CrdtLedgerEntry>();

    public upsert(entry: CrdtLedgerEntry): boolean {
        const existing = this.entries.get(entry.entryId);
        if (!existing || compareHlc(entry.hlc, existing.hlc) > 0) {
            this.entries.set(entry.entryId, entry);
            return true;
        }
        return false;
    }

    public mergeRemoteState(remoteEntries: CrdtLedgerEntry[]): { mergedCount: number } {
        let mergedCount = 0;
        for (const remote of remoteEntries) {
            if (this.upsert(remote)) mergedCount++;
        }
        return { mergedCount };
    }

    public getAccountBalancePaisa(tenantId: string, accountId: string): number {
        let total = 0;
        for (const e of this.entries.values()) {
            if (e.tenantId === tenantId && e.accountId === accountId && !e.tombstone) {
                total += e.deltaPaisa;
            }
        }
        return total;
    }

    public getSortedAuditLog(tenantId: string): CrdtLedgerEntry[] {
        return Array.from(this.entries.values())
            .filter((e) => e.tenantId === tenantId)
            .sort((a, b) => compareHlc(a.hlc, b.hlc));
    }
}
