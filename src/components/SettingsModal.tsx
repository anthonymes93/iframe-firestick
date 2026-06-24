import { useState, useEffect, useRef } from 'react';
import type { DisplayConfig, DisplayPage } from '../types';

interface Props {
  config: DisplayConfig;
  onSave: (config: DisplayConfig) => void;
  onClose: () => void;
  saveError?: string | null;
}

function generateId() {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

interface PageRow {
  page: DisplayPage;
  urlError: string;
}

export default function SettingsModal({ config, onSave, onClose, saveError }: Props) {
  const [rows, setRows] = useState<PageRow[]>(
    config.pages.map(p => ({ page: { ...p }, urlError: '' }))
  );
  const [defaultDuration, setDefaultDuration] = useState(String(config.defaultDurationMinutes));
  const [defaultDurationError, setDefaultDurationError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const updatePage = (index: number, patch: Partial<DisplayPage>) => {
    setRows(prev => prev.map((r, i) => {
      if (i !== index) return r;
      const updated = { ...r.page, ...patch };
      const urlError = patch.url !== undefined && patch.url !== '' && !isValidUrl(patch.url)
        ? 'Enter a valid URL (https://...)'
        : '';
      return { page: updated, urlError: patch.url !== undefined ? urlError : r.urlError };
    }));
  };

  const addPage = () => {
    setRows(prev => [...prev, {
      page: { id: generateId(), label: 'New Page', url: '', enabled: true },
      urlError: '',
    }]);
    // Scroll to bottom after render
    setTimeout(() => {
      overlayRef.current?.querySelector('.modal-page-list')?.scrollTo({ top: 99999, behavior: 'smooth' });
    }, 50);
  };

  const deletePage = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const movePage = (index: number, dir: -1 | 1) => {
    setRows(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = () => {
    // Inline validate to avoid async state lag
    let valid = true;
    const dur = parseFloat(defaultDuration);
    if (isNaN(dur) || dur <= 0) {
      setDefaultDurationError('Must be a positive number');
      valid = false;
    } else {
      setDefaultDurationError('');
    }
    const validatedRows = rows.map(r => {
      if (r.page.url === '') return { ...r, urlError: 'URL is required' };
      if (!isValidUrl(r.page.url)) return { ...r, urlError: 'Enter a valid URL (https://...)' };
      return { ...r, urlError: '' };
    });
    setRows(validatedRows);
    if (!valid || validatedRows.some(r => r.urlError)) return;

    onSave({
      defaultDurationMinutes: dur,
      pages: validatedRows.map(r => r.page),
    });
  };

  // Trap Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-warning">
            ⚠ Some sites block iframe embedding (X-Frame-Options / CSP). Those pages will show a fallback screen.
          </div>

          <div className="modal-default-duration">
            <label>
              Default rotation time (minutes)
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={defaultDuration}
                onChange={e => setDefaultDuration(e.target.value)}
                className={defaultDurationError ? 'input-error' : ''}
              />
            </label>
            {defaultDurationError && <span className="field-error">{defaultDurationError}</span>}
          </div>

          <div className="modal-page-list">
            {rows.length === 0 && (
              <p className="modal-empty">No pages yet. Click "Add Page" to get started.</p>
            )}
            {rows.map((row, i) => (
              <div key={row.page.id} className="modal-page-row">
                <div className="modal-page-row-header">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={row.page.enabled}
                      onChange={e => updatePage(i, { enabled: e.target.checked })}
                    />
                    <span className={`toggle-badge ${row.page.enabled ? 'enabled' : 'disabled'}`}>
                      {row.page.enabled ? 'ON' : 'OFF'}
                    </span>
                  </label>
                  <div className="modal-page-row-order">
                    <button onClick={() => movePage(i, -1)} disabled={i === 0} title="Move up">↑</button>
                    <button onClick={() => movePage(i, 1)} disabled={i === rows.length - 1} title="Move down">↓</button>
                  </div>
                  <button className="delete-btn" onClick={() => deletePage(i)} title="Delete page">✕</button>
                </div>

                <div className="modal-page-row-fields">
                  <label>
                    Label
                    <input
                      type="text"
                      value={row.page.label}
                      placeholder="Page label"
                      onChange={e => updatePage(i, { label: e.target.value })}
                    />
                  </label>
                  <label>
                    URL
                    <input
                      type="url"
                      value={row.page.url}
                      placeholder="https://example.com"
                      onChange={e => updatePage(i, { url: e.target.value })}
                      className={row.urlError ? 'input-error' : ''}
                    />
                    {row.urlError && <span className="field-error">{row.urlError}</span>}
                  </label>
                  <label>
                    Custom duration (min) <span className="optional">optional</span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      placeholder={`Default: ${defaultDuration} min`}
                      value={row.page.durationMinutes ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        updatePage(i, { durationMinutes: val === '' ? undefined : parseFloat(val) });
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button className="add-page-btn" onClick={addPage}>+ Add Page</button>
        </div>

        <div className="modal-footer">
          {saveError && <p className="modal-save-error">{saveError}</p>}
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
