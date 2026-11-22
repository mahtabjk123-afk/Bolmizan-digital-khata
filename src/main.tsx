import './utils/SovereignPrecisionFinance';
import { installViralGrowthInterceptor } from './utils/SovereignViralLoopInterceptor';
installViralGrowthInterceptor();
import { SovereignViralShare } from './utils/SovereignViralShare';
import { SovereignBackupDrawer } from './utils/SovereignBackupDrawer';
import { SovereignErrorBoundary, installBlackScreenGuard } from './utils/SovereignErrorBoundary';
installBlackScreenGuard();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { installOfflineAndroidBridge } from './utils/offlineAndroidBridge';

installOfflineAndroidBridge();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SovereignErrorBoundary><><App /><SovereignBackupDrawer /><SovereignViralShare /></></SovereignErrorBoundary>
    </StrictMode>
);


if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration skipped if unsupported
        });
    });
}
