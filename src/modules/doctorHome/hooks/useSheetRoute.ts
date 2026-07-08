import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDoctorViewSwapActive } from './useDoctorViewSwapActive';

const STACK_KEY = 'sheets';
const SHEET_URL_EVENT = 'doctor-home-sheet-url';

const normalizePath = (pathname: string) => (pathname === '/_' ? '/_/' : pathname);

function parseStack(query: Record<string, string | string[] | undefined>): string[] {
  const val = query[STACK_KEY];
  const str = Array.isArray(val) ? val[0] : (val ?? '');
  return str ? str.split(',').filter(Boolean) : [];
}

function parseStackFromLocation(): string[] {
  if (typeof window === 'undefined') return [];
  const val = new URLSearchParams(window.location.search).get(STACK_KEY) ?? '';
  return val ? val.split(',').filter(Boolean) : [];
}

function buildLocationQuery(
  base: Record<string, string | string[] | undefined>,
  stack: string[],
  extraParams: Record<string, string>,
): Record<string, string | string[] | undefined> {
  const next: Record<string, string | string[] | undefined> = { ...base };

  if (stack.length === 0) delete next[STACK_KEY];
  else next[STACK_KEY] = stack.join(',');

  Object.entries(extraParams).forEach(([key, value]) => {
    next[key] = value;
  });

  return next;
}

function toSearchParams(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) value.forEach(item => params.append(key, item));
    else params.set(key, value);
  });
  return params;
}

function queryFromLocation(): Record<string, string | string[] | undefined> {
  if (typeof window === 'undefined') return {};
  const next: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    next[key] = value;
  });
  return next;
}

function notifySheetUrlChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SHEET_URL_EVENT));
}

function writeHistoryUrl(pathname: string, query: Record<string, string | string[] | undefined>, method: 'push' | 'replace') {
  const params = toSearchParams(query);
  const search = params.toString();
  const url = search ? `${pathname}?${search}` : pathname;
  const state = window.history.state;

  if (method === 'push') window.history.pushState(state, '', url);
  else window.history.replaceState(state, '', url);

  notifySheetUrlChange();
}

/**
 * open state از useState هست → باز/بسته شدن فوری، بدون async delay.
 * URL برای sync با back/forward button و deep link استفاده میشه.
 *
 * در حالت view-swap روی `/` از history API استفاده می‌کنیم تا Next route عوض نشود.
 */
export function useSheetRoute(key: string) {
  const router = useRouter();
  const swapActive = useDoctorViewSwapActive();
  const useHistoryUrl = swapActive && router.pathname === '/';
  const [open, setOpen] = useState(false);
  const lastExtraParams = useRef<Record<string, string>>({});
  const pendingOpenState = useRef<boolean | null>(null);
  const lastClosedAt = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const readStack = useCallback(() => {
    if (useHistoryUrl) return parseStackFromLocation();
    return parseStack(router.query);
  }, [router.query, useHistoryUrl]);

  const syncFromUrl = useCallback(() => {
    if (!router.isReady) return;
    const isOpenInUrl = readStack().includes(key);

    if (pendingOpenState.current !== null) {
      if (isOpenInUrl === pendingOpenState.current) {
        pendingOpenState.current = null;
        setOpen(isOpenInUrl);
      }
      return;
    }

    setOpen(isOpenInUrl);
  }, [router.isReady, readStack, key]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    if (!router.isReady) return;

    const handleRouteChange = () => syncFromUrl();
    router.events.on('routeChangeComplete', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener(SHEET_URL_EVENT, handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener(SHEET_URL_EVENT, handleRouteChange);
    };
  }, [router.events, router.isReady, syncFromUrl]);

  const openSheet = useCallback(
    (extraParams?: Record<string, string>) => {
      if (Date.now() - lastClosedAt.current < 280) return;
      lastExtraParams.current = extraParams ?? {};
      pendingOpenState.current = true;
      setOpen(true);

      const currentStack = readStack();
      const newStack = [...currentStack.filter(k => k !== key), key];

      if (useHistoryUrl) {
        const pathname = normalizePath(window.location.pathname);
        const params = new URLSearchParams(window.location.search);
        params.set(STACK_KEY, newStack.join(','));
        Object.entries(extraParams ?? {}).forEach(([param, value]) => params.set(param, value));
        const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        window.history.pushState(window.history.state, '', url);
        pendingOpenState.current = null;
        notifySheetUrlChange();
        return;
      }

      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, [STACK_KEY]: newStack.join(','), ...extraParams },
        },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [router, key, readStack, useHistoryUrl],
  );

  const closeSheet = useCallback(() => {
    const currentStack = readStack();
    const isInUrl = currentStack.includes(key);
    if (!open && !isInUrl) return;

    lastClosedAt.current = Date.now();
    pendingOpenState.current = false;
    setOpen(false);

    if (!isInUrl) return;

    const newStack = currentStack.filter(k => k !== key);
    const baseQuery = useHistoryUrl ? queryFromLocation() : router.query;
    const newQuery = buildLocationQuery(baseQuery, newStack, {});
    Object.keys(lastExtraParams.current).forEach(param => {
      delete newQuery[param];
    });
    lastExtraParams.current = {};

    if (useHistoryUrl) {
      const pathname = normalizePath(window.location.pathname);
      writeHistoryUrl(pathname, newQuery, 'replace');
      pendingOpenState.current = null;
      return;
    }

    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true, scroll: false });
  }, [router, key, open, readStack, useHistoryUrl]);

  return { open, openSheet, closeSheet };
}

/** پراپ‌های استاندارد DsDrawer برای شیت‌های route-aware */
export const sheetDrawerProps = (sheet: { open: boolean; closeSheet: () => void }) => ({
  open: sheet.open,
  onOpenChange: (nextOpen: boolean) => {
    if (!nextOpen) sheet.closeSheet();
  },
});
