import { useState, useEffect, useRef, useCallback } from 'react';
import type { DisplayConfig } from '../types';

interface Props {
  config: DisplayConfig;
  paused: boolean;
}

type FadeState = 'visible' | 'fading-out' | 'fading-in';

export default function IframeRotator({ config, paused }: Props) {
  const enabledPages = config.pages.filter(p => p.enabled);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeState, setFadeState] = useState<FadeState>('visible');
  const [iframeError, setIframeError] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = (i: number) => ((i % enabledPages.length) + enabledPages.length) % enabledPages.length;

  const transitionTo = useCallback((nextIndex: number) => {
    if (fadeState !== 'visible') return;
    setFadeState('fading-out');
    setTimeout(() => {
      setActiveIndex(nextIndex);
      setCurrentIndex(nextIndex);
      setIframeError(false);
      setFadeState('fading-in');
      setTimeout(() => setFadeState('visible'), 400);
    }, 400);
  }, [fadeState]);

  useEffect(() => {
    if (paused || enabledPages.length <= 1 || fadeState !== 'visible') {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const page = enabledPages[currentIndex];
    const ms = (page?.durationMinutes ?? config.defaultDurationMinutes) * 60 * 1000;
    timerRef.current = setTimeout(() => {
      transitionTo(clamp(currentIndex + 1));
    }, ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, paused, fadeState, enabledPages.length, config.defaultDurationMinutes]);

  // Reset to first page when the page list changes
  useEffect(() => {
    setCurrentIndex(0);
    setActiveIndex(0);
    setIframeError(false);
    setFadeState('visible');
  }, [enabledPages.length]);

  if (enabledPages.length === 0) {
    return (
      <div className="rotator-empty">
        <p>No pages enabled. Click the settings icon to add pages.</p>
      </div>
    );
  }

  const page = enabledPages[activeIndex] ?? enabledPages[0];

  return (
    <div
      className="rotator-wrapper"
      style={{ opacity: fadeState === 'fading-out' ? 0 : 1 }}
    >
      {iframeError ? (
        <div className="iframe-fallback">
          <div className="iframe-fallback-inner">
            <div className="iframe-fallback-icon">⚠</div>
            <h2>{page.label}</h2>
            <p className="iframe-fallback-url">{page.url}</p>
            <p className="iframe-fallback-msg">This site may block iframe embedding.</p>
          </div>
        </div>
      ) : (
        <iframe
          key={`${page.id}-${activeIndex}`}
          src={page.url}
          title={page.label}
          className="rotator-iframe"
          onError={() => setIframeError(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
    </div>
  );
}
