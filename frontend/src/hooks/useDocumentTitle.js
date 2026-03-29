import { useEffect } from 'react';

const BASE = 'CitizenOne';

export function useDocumentTitle(segment) {
  useEffect(() => {
    const s = segment != null ? String(segment).trim() : '';
    const title =
      !s || s === BASE || s === 'Citizen One' ? BASE : `${s} · ${BASE}`;
    document.title = title;
    return () => {
      document.title = BASE;
    };
  }, [segment]);
}
