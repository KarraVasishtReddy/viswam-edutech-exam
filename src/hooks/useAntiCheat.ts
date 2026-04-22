import { useEffect, useCallback } from 'react';

interface ViolationData {
  type: 'tab_switch' | 'blur' | 'resize';
  details: string;
  timestamp: string;
}

export function useAntiCheat(
  isActive: boolean,
  onViolation: (violation: ViolationData) => void,
  onStateChange: (isFocused: boolean) => void
) {
  const handleVisibilityChange = useCallback(() => {
    if (!isActive) return;

    if (document.hidden) {
      onViolation({
        type: 'tab_switch',
        details: 'User switched tab or minimized window',
        timestamp: new Date().toISOString(),
      });
      onStateChange(false);
    } else {
      onStateChange(true);
    }
  }, [isActive, onViolation, onStateChange]);

  const handleBlur = useCallback(() => {
    if (!isActive) return;
    onViolation({
      type: 'blur',
      details: 'User lost window focus',
      timestamp: new Date().toISOString(),
    });
    onStateChange(false);
  }, [isActive, onViolation, onStateChange]);

  const handleFocus = useCallback(() => {
    if (!isActive) return;
    onStateChange(true);
  }, [isActive, onStateChange]);

  const handleResize = useCallback(() => {
    if (!isActive) return;
    if (window.innerWidth < 800) {
      onViolation({
        type: 'resize',
        details: 'Window resized below minimum width',
        timestamp: new Date().toISOString(),
      });
    }
  }, [isActive, onViolation]);

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', handleResize);

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation({
        type: 'blur',
        details: 'Attempted copy/cut operation detected',
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('copy', preventCopyCut);
    window.addEventListener('cut', preventCopyCut);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('copy', preventCopyCut);
      window.removeEventListener('cut', preventCopyCut);
    };
  }, [isActive, handleVisibilityChange, handleBlur, handleFocus, handleResize, onViolation]);
}
