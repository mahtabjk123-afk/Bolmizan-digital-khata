// server/paymentRailAdapter.ts
import crypto from 'crypto';

export interface SettlementInstruction {
    e2eId: string;
    payerAccountAlias: string;
    payeeAccountAlias: string;
    amountPaisa: number;
    currency: 'PKR';
    mode: 'SANDBOX_SIMULATION' | 'LICENSED_PARTNER_RAIL';
}

export interface SettlementReceipt {
    e2eId: string;
    status: 'SETTLED_SANDBOX' | 'QUEUED_FOR_PARTNER';
    clearingTimestamp: string;
    cryptographicProof: string;
}

// 1. Pluggable Non-Custodial Ledger Adapter (Sandbox Simulation + Licensed PSO/EMI Partner Hook)
export async function executeSettlementAdapter(
    instruction: SettlementInstruction,
    partnerApiKey?: string
): Promise<SettlementReceipt> {
    const clearingTimestamp = new Date().toISOString();

    const secret =
        partnerApiKey ||
        process.env.BOLMIZAN_SANDBOX_SIGNING_KEY ||
        'BOLMIZAN_NON_CUSTODIAL_SANDBOX_KEY';

    const payload = `${instruction.e2eId}|${instruction.payerAccountAlias}|${instruction.payeeAccountAlias}|${instruction.amountPaisa}|${clearingTimestamp}`;
    const cryptographicProof = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (!partnerApiKey) {
        return {
            e2eId: instruction.e2eId,
            status: 'SETTLED_SANDBOX',
            clearingTimestamp,
            cryptographicProof,
        };
    }

    return {
        e2eId: instruction.e2eId,
        status: 'QUEUED_FOR_PARTNER',
        clearingTimestamp,
        cryptographicProof,
    };
}

// 2. Incoming Partner Webhook HMAC Signature Verifier (Constant-Time Comparison)
export function verifyIncomingWebhookSignature(
    rawBody: string,
    receivedSignatureHeader: string,
    webhookSecret: string
): boolean {
    if (!rawBody || !receivedSignatureHeader || !webhookSecret) {
        return false;
    }

    const expectedHex = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    const cleanReceived = receivedSignatureHeader.trim().toLowerCase();

    if (expectedHex.length !== cleanReceived.length || !/^[0-9a-f]+$/.test(cleanReceived)) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(expectedHex, 'hex'),
        Buffer.from(cleanReceived, 'hex')
    );
}
