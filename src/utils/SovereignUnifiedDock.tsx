import React, { useState, useEffect } from 'react';
import { Sovereign3DSpatialLayer } from './Sovereign3DSpatialLayer';
import { SovereignAiBoardroom } from './SovereignAiBoardroom';
import { SovereignSecurityAndTerms } from './SovereignSecurityAndTerms';
import { SovereignMasterControl } from './SovereignMasterControl';
import { SovereignHabitEngine } from './SovereignHabitEngine';
import { SovereignFeedbackWidget } from './SovereignFeedbackWidget';
import { SovereignBackupDrawer } from './SovereignBackupDrawer';
import { SovereignFounderHub } from './SovereignFounderHub';
import { SovereignViralShare } from './SovereignViralShare';

export const SovereignUnifiedDock: React.FC = () => {
  const [toolsVisible, setToolsVisible] = useState(false);

  useEffect(() => {
    try {
      const hasPin = (localStorage.getItem('bolmizan_sovereign_merchant_pin') || '').length === 4;
      const isPaused = (localStorage.getItem('bolmizan_sovereign_master_control_v1') || '').includes('PAUSED');
      if (hasPin || isPaused) setToolsVisible(true);
    } catch {}
  }, []);

  const toggleBtn = React.createElement(
    'button',
    {
      onClick: () => setToolsVisible(!toolsVisible),
      style: {
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 10000,
        background: 'linear-gradient(135deg, #064e3b, #1e1b4b)',
        color: '#fde68a',
        border: '1.5px solid #f59e0b',
        borderRadius: '999px',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: 900,
        boxShadow: '0 6px 20px rgba(0,0,0,0.65)',
        cursor: 'pointer'
      }
    },
    toolsVisible ? '✕ Hide Pro Tools' : '⚡ Sovereign Pro & AI Tools'
  );

  const toolsGroup = toolsVisible
    ? React.createElement(
        React.Fragment,
        null,
        React.createElement(Sovereign3DSpatialLayer),
        React.createElement(SovereignAiBoardroom),
        React.createElement(SovereignSecurityAndTerms),
        React.createElement(SovereignMasterControl),
        React.createElement(SovereignHabitEngine),
        React.createElement(SovereignFeedbackWidget),
        React.createElement(SovereignBackupDrawer),
        React.createElement(SovereignFounderHub),
        React.createElement(SovereignViralShare)
      )
    : null;

  return React.createElement(React.Fragment, null, toggleBtn, toolsGroup);
};