import React, { useState } from "react";

interface OmegaHomeGatewayProps {
    onOpenVoiceKhata: () => void;
    onOpenScanVerify: () => void;
    onEnterProMode: () => void;
    languageMode: "LOCAL" | "GLOBAL";
    onToggleLanguage: () => void;
}

export const OmegaHomeGateway: React.FC<OmegaHomeGatewayProps> = ({
    onOpenVoiceKhata,
    onOpenScanVerify,
    onEnterProMode,
    languageMode,
    onToggleLanguage,
}) => {
    const [quickStatus] = useState("Offline-First CRDT Mesh & Stego Shield Active");

    const isLocal = languageMode === "LOCAL";

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 font-sans">
            {/* Top Minimal Header */}
            <header className="flex items-center justify-between max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-emerald-400">
                            BolMizan <span className="text-xs bg-emerald-950 border border-emerald-700 px-2 py-0.5 rounded-full">OMEGA</span>
                        </h1>
                        <p className="text-xs text-slate-400">{quickStatus}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleLanguage}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 transition"
                    >
                        {isLocal ? "🇵🇰 Urdu / Sindhi" : "🌍 Global Ethical FinTech"}
                    </button>
                    <button
                        onClick={onEnterProMode}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 transition font-medium"
                    >
                        ⚡ Pro Command
                    </button>
                </div>
            </header>

            {/* Center: Zero-Friction 2-Button Core */}
            <main className="max-w-2xl mx-auto w-full my-auto py-10 text-center space-y-8">
                <div className="space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        {isLocal
                            ? "Awaaz Se Halal Khata, Ya Scan Se Fori Tahaffuz"
                            : "Voice-First Riba-Free Ledger & Cryptographic Trust OS"}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                        {isLocal
                            ? "Bina likhe bol kar parchi banayein, ya kisi bhi bill, contract aur message ka sood aur fraud check karein."
                            : "Create tamper-proof Islamic contracts by voice or verify documents against Riba, fraud, and tampering offline."}
                    </p>
                </div>

                {/* The 2 Magic Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={onOpenVoiceKhata}
                        className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-left shadow-xl shadow-emerald-950/50 transition-all transform hover:-translate-y-1"
                    >
                        <div className="text-4xl mb-4">🎤</div>
                        <h3 className="text-xl font-bold text-white">
                            {isLocal ? "Bol Kar Likhein" : "Speak & Record"}
                        </h3>
                        <p className="text-emerald-100 text-xs mt-1">
                            {isLocal
                                ? "Mandi parchi, udhaar khata, ya halal muahida awaaz se tayyar karein"
                                : "Voice-to-Ledger & Riba-Free Contract Generator"}
                        </p>
                    </button>

                    <button
                        onClick={onOpenScanVerify}
                        className="group p-6 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-amber-500/60 text-left shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <div className="text-4xl mb-4">🛡️</div>
                        <h3 className="text-xl font-bold text-white">
                            {isLocal ? "Scan & Verify Karein" : "Scan & Audit"}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                            {isLocal
                                ? "Stego-parchi ki asliyat, sood (Riba), aur online scam pakrein"
                                : "Steganography Proof, Riba Contract Audit & Scam Shield"}
                        </p>
                    </button>
                </div>
            </main>

            {/* Bottom Trust Strip */}
            <footer className="max-w-3xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-900 pt-4">
                100% Offline-First • Zero-Trust Cryptography • Quran & Sunnah Compliant (Mizan & Amaan)
            </footer>
        </div>
    );
};
