export async function sha256Hex(value: string): Promise<string> {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
        throw new Error('Web Crypto is unavailable; a SHA-256 receipt fingerprint cannot be created.');
    }

    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function parseExplicitPkrAmount(value: string): number | null {
    const match = value.match(
        /(?:(?:PKR|Rs\.?|rupees?)\s*([\d,Ù¬Û°-Û¹Ù -Ù©]+)(?![\d,Ù¬]|\.\d)|([\d,Ù¬Û°-Û¹Ù -Ù©]+)(?![\d,Ù¬]|\.\d)\s*(?:PKR|Rs\.?|rupees?)|(?:Ø±ÙˆÙ¾Û’|Ø±Ù¾ÙŠØ§)\s*([\d,Ù¬Û°-Û¹Ù -Ù©]+)(?![\d,Ù¬]|\.\d)|([\d,Ù¬Û°-Û¹Ù -Ù©]+)(?![\d,Ù¬]|\.\d)\s*(?:Ø±ÙˆÙ¾Û’|Ø±Ù¾ÙŠØ§))/i,
    );
    const digits = match?.slice(1).find((part) => part !== undefined);
    if (!digits) return null;

    const urduDigits = 'Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹';
    const arabicDigits = 'Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©';
    const normalized = digits
        .replace(/[Û°-Û¹Ù -Ù©]/g, (character) => {
            const urduIndex = urduDigits.indexOf(character);
            return String(urduIndex >= 0 ? urduIndex : arabicDigits.indexOf(character));
        })
        .replace(/[Ù¬,]/g, '');
    const amount = Number(normalized);
    return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
