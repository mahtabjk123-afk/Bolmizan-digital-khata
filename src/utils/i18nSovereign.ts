export type SupportedSovereignLanguage = 'en' | 'ur' | 'sd' | 'ar';

export interface SovereignCopy {
    direction: 'ltr' | 'rtl';
    speechLanguage: string;
    languageName: string;
    shieldTitle: string;
    shieldDescription: string;
    localControlNote: string;
    controlPinLabel: string;
    freezeControls: string;
    restoreControls: string;
    frozenStatus: string;
    activeStatus: string;
    scamScannerTitle: string;
    scamScannerPlaceholder: string;
    runScamScanner: string;
    scamBlockedAlert: string;
    scanCompleted: string;
    truthFilterTitle: string;
    truthFilterPlaceholder: string;
    runTruthFilter: string;
    localFingerprint: string;
    offlineAppShellNote: string;
}

export const SOVEREIGN_COPY: Readonly<Record<SupportedSovereignLanguage, SovereignCopy>> = {
    en: {
        direction: 'ltr',
        speechLanguage: 'en-US',
        languageName: 'English',
        shieldTitle: 'Safety tools',
        shieldDescription: 'Text-based scam signals and invoice checks. Results are heuristic, not identity verification.',
        localControlNote: 'Local controls only; external payment providers are not frozen by this switch.',
        controlPinLabel: 'Control PIN',
        freezeControls: 'Freeze internal operations',
        restoreControls: 'Restore internal operations',
        frozenStatus: 'INTERNAL OPERATIONS FROZEN',
        activeStatus: 'INTERNAL CONTROLS ACTIVE',
        scamScannerTitle: 'Scam-text signal check',
        scamScannerPlaceholder: 'Paste a suspicious SMS or caller transcriptâ€¦',
        runScamScanner: 'Check text for scam signals',
        scamBlockedAlert: 'Potential scam signals found. Verify independently before acting.',
        scanCompleted: 'Text scan completed; this is not identity verification.',
        truthFilterTitle: 'Text and invoice check',
        truthFilterPlaceholder: 'Paste contract text, a message, or invoiceâ€¦',
        runTruthFilter: 'Check text and invoice math',
        localFingerprint: 'Local SHA-256 fingerprint',
        offlineAppShellNote: 'The app shell may be cached; server-backed features still require a connection.',
    },
    ur: {
        direction: 'rtl',
        speechLanguage: 'ur-PK',
        languageName: 'Ø§Ø±Ø¯Ùˆ',
        shieldTitle: 'Ø­ÙØ§Ø¸ØªÛŒ Ù¹ÙˆÙ„Ø²',
        shieldDescription: 'Ù…ØªÙ† Ù…ÛŒÚº ÙØ±Ø§Úˆ Ú©Û’ Ø§Ø´Ø§Ø±Û’ Ø§ÙˆØ± Ø±Ø³ÛŒØ¯ Ú©Û’ Ø­Ø³Ø§Ø¨ Ú©ÛŒ Ø¬Ø§Ù†Ú†Û” ÛŒÛ Ø´Ù†Ø§Ø®Øª Ú©ÛŒ ØªØµØ¯ÛŒÙ‚ Ù†ÛÛŒÚºÛ”',
        localControlNote: 'ÛŒÛ Ø³ÙˆØ¦Ú† ØµØ±Ù Ù…Ù‚Ø§Ù…ÛŒ Ø¢Ù¾Ø±ÛŒØ´Ù†Ø² Ú©Ùˆ Ø±ÙˆÚ©ØªØ§ ÛÛ’Ø› Ø¨ÛŒØ±ÙˆÙ†ÛŒ Ø§Ø¯Ø§Ø¦ÛŒÚ¯ÛŒ Ø³Ø±ÙˆØ³Ø² Ù…Ù†Ø¬Ù…Ø¯ Ù†ÛÛŒÚº ÛÙˆØªÛŒÚºÛ”',
        controlPinLabel: 'Ú©Ù†Ù¹Ø±ÙˆÙ„ Ù¾Ù†',
        freezeControls: 'Ù…Ù‚Ø§Ù…ÛŒ Ø¢Ù¾Ø±ÛŒØ´Ù†Ø² Ø±ÙˆÚ©ÛŒÚº',
        restoreControls: 'Ù…Ù‚Ø§Ù…ÛŒ Ø¢Ù¾Ø±ÛŒØ´Ù†Ø² Ø¨Ø­Ø§Ù„ Ú©Ø±ÛŒÚº',
        frozenStatus: 'Ù…Ù‚Ø§Ù…ÛŒ Ø¢Ù¾Ø±ÛŒØ´Ù†Ø² Ø±Ú©Û’ ÛÙˆØ¦Û’ ÛÛŒÚº',
        activeStatus: 'Ù…Ù‚Ø§Ù…ÛŒ Ú©Ù†Ù¹Ø±ÙˆÙ„ ÙØ¹Ø§Ù„ ÛÛŒÚº',
        scamScannerTitle: 'ÙØ±Ø§Úˆ ÙˆØ§Ù„Û’ Ù…ØªÙ† Ú©ÛŒ Ø¬Ø§Ù†Ú†',
        scamScannerPlaceholder: 'Ù…Ø´Ú©ÙˆÚ© Ø§ÛŒØ³ Ø§ÛŒÙ… Ø§ÛŒØ³ ÛŒØ§ Ú©Ø§Ù„ Ú©Ø§ Ù…ØªÙ† Ù¾ÛŒØ³Ù¹ Ú©Ø±ÛŒÚºâ€¦',
        runScamScanner: 'Ù…ØªÙ† Ù…ÛŒÚº ÙØ±Ø§Úˆ Ú©Û’ Ø§Ø´Ø§Ø±Û’ Ø¯ÛŒÚ©Ú¾ÛŒÚº',
        scamBlockedAlert: 'Ù…Ù…Ú©Ù†Û ÙØ±Ø§Úˆ Ú©Û’ Ø§Ø´Ø§Ø±Û’ Ù…Ù„Û’ ÛÛŒÚºÛ” Ú©ÙˆØ¦ÛŒ Ù‚Ø¯Ù… Ø§Ù¹Ú¾Ø§Ù†Û’ Ø³Û’ Ù¾ÛÙ„Û’ Ø¢Ø²Ø§Ø¯Ø§Ù†Û ØªØµØ¯ÛŒÙ‚ Ú©Ø±ÛŒÚºÛ”',
        scanCompleted: 'Ù…ØªÙ† Ú©ÛŒ Ø¬Ø§Ù†Ú† Ù…Ú©Ù…Ù„ ÛÙˆØ¦ÛŒØ› ÛŒÛ Ø´Ù†Ø§Ø®Øª Ú©ÛŒ ØªØµØ¯ÛŒÙ‚ Ù†ÛÛŒÚºÛ”',
        truthFilterTitle: 'Ù…ØªÙ† Ø§ÙˆØ± Ø±Ø³ÛŒØ¯ Ú©ÛŒ Ø¬Ø§Ù†Ú†',
        truthFilterPlaceholder: 'Ù…Ø¹Ø§ÛØ¯ÛØŒ Ù¾ÛŒØºØ§Ù… ÛŒØ§ Ø±Ø³ÛŒØ¯ Ú©Ø§ Ù…ØªÙ† Ù¾ÛŒØ³Ù¹ Ú©Ø±ÛŒÚºâ€¦',
        runTruthFilter: 'Ù…ØªÙ† Ø§ÙˆØ± Ø±Ø³ÛŒØ¯ Ú©Ø§ Ø­Ø³Ø§Ø¨ Ø¬Ø§Ù†Ú†ÛŒÚº',
        localFingerprint: 'Ù…Ù‚Ø§Ù…ÛŒ SHA-256 ÙÙ†Ú¯Ø±Ù¾Ø±Ù†Ù¹',
        offlineAppShellNote: 'Ø§ÛŒÙ¾ Ú©Ø§ Ø®ÙˆÙ„ Ù…Ø­ÙÙˆØ¸ ÛÙˆ Ø³Ú©ØªØ§ ÛÛ’Ø› Ø³Ø±ÙˆØ± ÙˆØ§Ù„Û’ Ú©Ø§Ù… Ú©Û’ Ù„ÛŒÛ’ Ø§Ù†Ù¹Ø±Ù†ÛŒÙ¹ Ø¯Ø±Ú©Ø§Ø± ÛÛ’Û”',
    },
    sd: {
        direction: 'rtl',
        speechLanguage: 'sd-PK',
        languageName: 'Ø³Ù†ÚŒÙŠ',
        shieldTitle: 'Ø­ÙØ§Ø¸ØªÙŠ Ø§ÙˆØ²Ø§Ø±',
        shieldDescription: 'Ù„Ú©ÙŠÙ„ Ù…ØªÙ† Û¾ Ø¯ÙˆÚ©ÙŠ Ø¬Ø§ Ø§Ø´Ø§Ø±Ø§ Û½ Ø¨Ù„ Ø¬Ùˆ Ø­Ø³Ø§Ø¨ Ø¬Ø§Ú†ÙŠÙˆ. Ù‡ÙŠ Ø³ÚƒØ§Ú»Ù¾ Ø¬ÙŠ ØªØµØ¯ÙŠÙ‚ Ù†Ø§Ù‡ÙŠ.',
        localControlNote: 'Ù‡ÙŠ Ø³ÙˆØ¦Ú† Ø±Ú³Ùˆ Ù…Ù‚Ø§Ù…ÙŠ Ø¹Ù…Ù„ Ø±ÙˆÚªÙŠ Ù¿ÙˆØ› Ù»Ø§Ù‡Ø±ÙŠÙˆÙ† Ø§Ø¯Ø§Ø¦ÙŠÚ¯ÙŠ Ø¬Ø§ Ù†ÙŠÙ½ ÙˆØ±Úª Ø¨Ù†Ø¯ Ù†Ù¿Ø§ Ù¿ÙŠÙ†.',
        controlPinLabel: 'ÚªÙ†Ù½Ø±ÙˆÙ„ Ù¾Ù†',
        freezeControls: 'Ù…Ù‚Ø§Ù…ÙŠ Ø¹Ù…Ù„ Ø±ÙˆÚªÙŠÙˆ',
        restoreControls: 'Ù…Ù‚Ø§Ù…ÙŠ Ø¹Ù…Ù„ Ø¨Ø­Ø§Ù„ ÚªØ±ÙŠÙˆ',
        frozenStatus: 'Ù…Ù‚Ø§Ù…ÙŠ Ø¹Ù…Ù„ Ø±ÙˆÚªÙŠÙ„ Ø¢Ù‡Ù†',
        activeStatus: 'Ù…Ù‚Ø§Ù…ÙŠ ÚªÙ†Ù½Ø±ÙˆÙ„ ÙØ¹Ø§Ù„ Ø¢Ù‡Ù†',
        scamScannerTitle: 'Ø¯ÙˆÚ©ÙŠ ÙˆØ§Ø±ÙŠ Ù…ØªÙ† Ø¬ÙŠ Ø¬Ø§Ú†',
        scamScannerPlaceholder: 'Ø´ÚªÙŠ Ø§ÙŠØ³ Ø§ÙŠÙ… Ø§ÙŠØ³ ÙŠØ§ ÚªØ§Ù„ Ø¬Ùˆ Ù…ØªÙ† Ù¾ÙŠØ³Ù½ ÚªØ±ÙŠÙˆâ€¦',
        runScamScanner: 'Ù…ØªÙ† Û¾ Ø¯ÙˆÚ©ÙŠ Ø¬Ø§ Ø§Ø´Ø§Ø±Ø§ ÚØ³Ùˆ',
        scamBlockedAlert: 'Ø¯ÙˆÚ©ÙŠ Ø¬Ø§ Ø§Ù…ÚªØ§Ù†ÙŠ Ø§Ø´Ø§Ø±Ø§ Ù…Ù„ÙŠØ§. Ø¹Ù…Ù„ ÚªØ±Ú» Ú©Ø§Ù† Ø§Ú³ Ø§Ù„Ú³ ØªØµØ¯ÙŠÙ‚ ÚªØ±ÙŠÙˆ.',
        scanCompleted: 'Ù…ØªÙ† Ø¬ÙŠ Ø¬Ø§Ú† Ù…ÚªÙ…Ù„Ø› Ù‡ÙŠ Ø³ÚƒØ§Ú»Ù¾ Ø¬ÙŠ ØªØµØ¯ÙŠÙ‚ Ù†Ø§Ù‡ÙŠ.',
        truthFilterTitle: 'Ù…ØªÙ† Û½ Ø¨Ù„ Ø¬ÙŠ Ø¬Ø§Ú†',
        truthFilterPlaceholder: 'Ù…Ø¹Ø§Ù‡Ø¯ÙŠØŒ Ù¾ÙŠØºØ§Ù… ÙŠØ§ Ø¨Ù„ Ø¬Ùˆ Ù…ØªÙ† Ù¾ÙŠØ³Ù½ ÚªØ±ÙŠÙˆâ€¦',
        runTruthFilter: 'Ù…ØªÙ† Û½ Ø¨Ù„ Ø¬Ùˆ Ø­Ø³Ø§Ø¨ Ø¬Ø§Ú†ÙŠÙˆ',
        localFingerprint: 'Ù…Ù‚Ø§Ù…ÙŠ SHA-256 ÙÙ†Ú¯Ø±Ù¾Ø±Ù†Ù½',
        offlineAppShellNote: 'Ø§ÙŠÙ¾ Ø¬Ùˆ Ø®ÙˆÙ„ Ù…Ø­ÙÙˆØ¸ Ù¿ÙŠ Ø³Ú¯Ù‡ÙŠ Ù¿ÙˆØ› Ø³Ø±ÙˆØ± ÙˆØ§Ø±ÙŠ ÚªÙ… Ù„Ø§Ø¡Ù Ù†ÙŠÙ½ Ú¯Ù‡Ø±Ø¨Ù„ Ø¢Ù‡ÙŠ.',
    },
    ar: {
        direction: 'rtl',
        speechLanguage: 'ar-SA',
        languageName: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
        shieldTitle: 'Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø­Ù…Ø§ÙŠØ©',
        shieldDescription: 'ÙØ­Øµ Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„ ÙÙŠ Ø§Ù„Ù†ØµÙˆØµ ÙˆØ­Ø³Ø§Ø¨ Ø§Ù„ÙÙˆØ§ØªÙŠØ±. Ù„Ø§ ÙŠØ«Ø¨Øª Ù‡ÙˆÙŠØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù….',
        localControlNote: 'ÙŠÙˆÙ‚Ù Ù‡Ø°Ø§ Ø§Ù„Ù…ÙØªØ§Ø­ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…Ø­Ù„ÙŠØ© ÙÙ‚Ø·ØŒ ÙˆÙ„Ø§ ÙŠØ¬Ù…Ù‘Ø¯ Ù…Ø²ÙˆØ¯ÙŠ Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠÙŠÙ†.',
        controlPinLabel: 'Ø±Ù…Ø² Ø§Ù„ØªØ­ÙƒÙ…',
        freezeControls: 'Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©',
        restoreControls: 'Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©',
        frozenStatus: 'Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ù…ØªÙˆÙ‚ÙØ©',
        activeStatus: 'Ø¹Ù†Ø§ØµØ± Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ù†Ø´Ø·Ø©',
        scamScannerTitle: 'ÙØ­Øµ Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„ Ø§Ù„Ù†ØµÙŠØ©',
        scamScannerPlaceholder: 'Ø§Ù„ØµÙ‚ Ø±Ø³Ø§Ù„Ø© Ù…Ø´Ø¨ÙˆÙ‡Ø© Ø£Ùˆ Ù†Øµ Ù…ÙƒØ§Ù„Ù…Ø©â€¦',
        runScamScanner: 'ÙØ­Øµ Ø§Ù„Ù†Øµ Ø¨Ø­Ø«Ø§Ù‹ Ø¹Ù† Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„',
        scamBlockedAlert: 'Ø¹ÙØ«Ø± Ø¹Ù„Ù‰ Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ø­ØªÙŠØ§Ù„ Ù…Ø­ØªÙ…Ù„Ø©. ØªØ­Ù‚Ù‘Ù‚ Ø¨Ø´ÙƒÙ„ Ù…Ø³ØªÙ‚Ù„ Ù‚Ø¨Ù„ Ø§Ù„ØªØµØ±Ù.',
        scanCompleted: 'Ø§ÙƒØªÙ…Ù„ ÙØ­Øµ Ø§Ù„Ù†ØµØ› Ù‡Ø°Ø§ Ù„Ø§ ÙŠØ«Ø¨Øª Ø§Ù„Ù‡ÙˆÙŠØ©.',
        truthFilterTitle: 'ÙØ­Øµ Ø§Ù„Ù†Øµ ÙˆØ§Ù„ÙØ§ØªÙˆØ±Ø©',
        truthFilterPlaceholder: 'Ø§Ù„ØµÙ‚ Ù†Øµ Ø¹Ù‚Ø¯ Ø£Ùˆ Ø±Ø³Ø§Ù„Ø© Ø£Ùˆ ÙØ§ØªÙˆØ±Ø©â€¦',
        runTruthFilter: 'ÙØ­Øµ Ø§Ù„Ù†Øµ ÙˆØ­Ø³Ø§Ø¨ Ø§Ù„ÙØ§ØªÙˆØ±Ø©',
        localFingerprint: 'Ø¨ØµÙ…Ø© SHA-256 Ù…Ø­Ù„ÙŠØ©',
        offlineAppShellNote: 'Ù‚Ø¯ ØªÙØ­ÙØ¸ ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø› Ø§Ù„Ù…ÙŠØ²Ø§Øª Ø§Ù„ØªÙŠ ØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø¯Ù… ØªØ­ØªØ§Ø¬ Ø§ØªØµØ§Ù„Ø§Ù‹.',
    },
};

export function getSovereignCopy(language: SupportedSovereignLanguage): SovereignCopy {
    return SOVEREIGN_COPY[language];
}
