import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './utils/sovereignSoundEngine';
import './utils/sovereignIndexedDbVault';
import './utils/SovereignZeroLoopholeShield';
import './utils/SovereignPrecisionFinance';
import './utils/SovereignCenturyEngine';
import './utils/SovereignAntiCloneGuard';
import { installViralGrowthInterceptor } from './utils/SovereignViralLoopInterceptor';
import { SovereignErrorBoundary } from './utils/SovereignErrorBoundary';
import { SovereignBrandIdentity } from './utils/SovereignBrandIdentity';
import { SovereignAamAadmiMode } from './utils/SovereignAamAadmiMode';
import { SovereignRockingChatbot } from './utils/SovereignRockingChatbot';
import { SovereignUnifiedDock } from './utils/SovereignUnifiedDock';

installViralGrowthInterceptor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      SovereignErrorBoundary,
      null,
      React.createElement(SovereignBrandIdentity),
      React.createElement(App),
      React.createElement(SovereignAamAadmiMode),
      React.createElement(SovereignRockingChatbot),
      React.createElement(SovereignUnifiedDock)
    )
  )
);