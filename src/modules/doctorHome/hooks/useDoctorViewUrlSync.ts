import { useRouter } from 'next/router';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useDoctorViewModeStore, type DoctorViewMode } from '../store/viewMode';

const modeFromPath = (pathname: string): DoctorViewMode | null => {
  if (pathname === '/' || pathname === '/apphome') return 'patient';
  if (pathname === '/_/' || pathname === '/_') return 'doctor';
  return null;
};

const normalizePath = (pathname: string) => (pathname === '/_' ? '/_/' : pathname);

export const useDoctorViewUrlSync = (enabled: boolean) => {
  const router = useRouter();
  const mode = useDoctorViewModeStore(state => state.mode);
  const setMode = useDoctorViewModeStore(state => state.setMode);
  const syncingFromMode = useRef(false);
  const prevMode = useRef(mode);

  useLayoutEffect(() => {
    if (!enabled) return;

    const target = mode === 'patient' ? '/' : '/_/';
    const currentPath = normalizePath(window.location.pathname);
    const modeChanged = prevMode.current !== mode;
    prevMode.current = mode;

    if (currentPath === target && !modeChanged) return;

    const search = modeChanged ? '' : window.location.search;
    syncingFromMode.current = true;
    window.history.replaceState({ ...window.history.state, as: target, url: target + search }, '', target + search);
    syncingFromMode.current = false;
  }, [enabled, mode]);

  useEffect(() => {
    if (!enabled) return;

    const syncModeFromUrl = () => {
      if (syncingFromMode.current) return;
      const nextMode = modeFromPath(normalizePath(window.location.pathname));
      if (!nextMode || nextMode === useDoctorViewModeStore.getState().mode) return;
      setMode(nextMode);
    };

    syncModeFromUrl();
    router.events.on('routeChangeComplete', syncModeFromUrl);
    window.addEventListener('popstate', syncModeFromUrl);

    return () => {
      router.events.off('routeChangeComplete', syncModeFromUrl);
      window.removeEventListener('popstate', syncModeFromUrl);
    };
  }, [enabled, router.events, setMode]);
};
