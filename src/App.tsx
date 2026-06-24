import { useState } from 'react';
import IframeRotator from './components/IframeRotator';
import SettingsModal from './components/SettingsModal';
import type { DisplayConfig } from './types';
import { loadConfig, saveConfig } from './utils/storage';
import './App.css';

export default function App() {
  const [config, setConfig] = useState<DisplayConfig>(loadConfig);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (updated: DisplayConfig) => {
    saveConfig(updated);
    setConfig(updated);
    setShowModal(false);
  };

  return (
    <div className="app">
      <button
        className="settings-btn"
        onClick={() => setShowModal(prev => !prev)}
        aria-label="Open settings"
        title="Settings"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <IframeRotator config={config} paused={showModal} />

      {showModal && (
        <SettingsModal
          config={config}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
