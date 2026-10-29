import { useMemo, useSyncExternalStore } from 'react';

function getSearchSnapshot() {
  return typeof window !== 'undefined' ? window.location.search : '';
}

/**
 * URLSearchParams from window.location, synced on popstate and history push/replace.
 * Works without react-router — avoids blank screen when Phone is embedded outside Router.
 */
function subscribeSearch(callback) {
  const onPop = () => callback();
  window.addEventListener('popstate', onPop);

  const onPushReplace = () => callback();
  window.addEventListener('hackhilis-url', onPushReplace);

  if (!subscribeSearch._patched) {
    subscribeSearch._patched = true;
    const h = window.history;
    const origPush = h.pushState.bind(h);
    const origReplace = h.replaceState.bind(h);
    h.pushState = function patchedPush(...args) {
      origPush(...args);
      window.dispatchEvent(new Event('hackhilis-url'));
    };
    h.replaceState = function patchedReplace(...args) {
      origReplace(...args);
      window.dispatchEvent(new Event('hackhilis-url'));
    };
  }

  return () => {
    window.removeEventListener('popstate', onPop);
    window.removeEventListener('hackhilis-url', onPushReplace);
  };
}

export function useUrlSearchParams() {
  const search = useSyncExternalStore(subscribeSearch, getSearchSnapshot, () => '');
  return useMemo(() => new URLSearchParams(search), [search]);
}
