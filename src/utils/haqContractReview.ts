export type ContractFlag = {
    category: 'INTEREST_OR_RATE' | 'LATE_PENALTY' | 'UNILATERAL_TERMINATION' | 'COMPOUNDING';
    excerpt: string;
    message: string;
};

const RULES: Array<{ category: ContractFlag['category']; pattern: RegExp; message: string }> = [
    { category: 'INTEREST_OR_RATE', pattern: /(?:\binterest\b|\bAPR\b|\bmarkup\b|\briba\b|Ø³ÙˆØ¯|Ù…Ù†Ø§ÙØ¹|Ø§Ø¶Ø§ÙÛŒ Ø±Ù‚Ù…)[^.!?\n]{0,100}(?:\d+(?:\.\d+)?\s?%|Ø³Ø§Ù„Ø§Ù†Û|Ù…Ø§ÛØ§Ù†Û|Ø³Ø§Ù„Ø§Ù†Û Ø´Ø±Ø­)?/gi, message: 'Possible interest/rate wording. Ask a qualified adviser to review the exact clause.' },
    { category: 'LATE_PENALTY', pattern: /(?:late fee|late payment|penalty|default charge|Ø¬Ø±Ù…Ø§Ù†Û|ØªØ§Ø®ÛŒØ±)[^.!?\n]{0,120}/gi, message: 'Possible late-payment fee or penalty wording.' },
    { category: 'UNILATERAL_TERMINATION', pattern: /(?:sole discretion|without notice|terminate at any time|unilateral termination|Ø¨ØºÛŒØ± Ø§Ø·Ù„Ø§Ø¹|ÛŒÚ©Ø·Ø±ÙÛ Ù…Ù†Ø³ÙˆØ®)[^.!?\n]{0,120}/gi, message: 'Possible one-sided termination or notice wording.' },
    { category: 'COMPOUNDING', pattern: /(?:compound(?:ed|ing)? interest|interest on interest|monthly compounding|Ù…Ø±Ú©Ø¨ Ø³ÙˆØ¯)[^.!?\n]{0,120}/gi, message: 'Possible compounding wording.' },
];

export function reviewContractText(text: string): ContractFlag[] {
    const normalized = text.normalize('NFC').slice(0, 20_000);
    const flags: ContractFlag[] = [];
    for (const rule of RULES) {
        rule.pattern.lastIndex = 0;
        for (const match of normalized.matchAll(rule.pattern)) {
            const excerpt = (match[0] || '').trim().slice(0, 180);
            if (excerpt) flags.push({ category: rule.category, excerpt, message: rule.message });
        }
    }
    return flags.slice(0, 30);
}
