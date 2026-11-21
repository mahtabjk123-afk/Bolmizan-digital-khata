export async function sha256Hex(value: string): Promise<string> {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
        throw new Error('Web Crypto is unavailable; a SHA-256 receipt fingerprint cannot be created.');
    }

    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const CURRENCY_LABELS = '(?:PKR|Rs\\.?|rupees?|rupay|\\u0631\\u0648\\u067e\\u06d2|\\u0631\\u0648\\u067e\\u06cc\\u06c1|\\u0631\\u067e\\u064a\\u0627)';
const DIGIT_GROUP = '([\\d,\\u066c\\u06f0-\\u06f9\\u0660-\\u0669]+)(?![\\d,\\u066c]|\\.\\d)';
const EXPLICIT_PKR_REGEX = new RegExp(
    `(?:${CURRENCY_LABELS}\\s*${DIGIT_GROUP}|${DIGIT_GROUP}\\s*${CURRENCY_LABELS})`,
    'i',
);

export function parseExplicitPkrAmount(value: string): number | null {
    if (!value || typeof value !== 'string') return null;

    const match = value.match(EXPLICIT_PKR_REGEX);
    const digits = match?.[1] ?? match?.[2];
    if (!digits) return null;

    const normalized = digits
        .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
        .replace(/[\u06f0-\u06f9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
        .replace(/[\u066c,]/g, '');

    const amount = Number(normalized);
    return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
