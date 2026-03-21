import { useEffect } from 'react';

const BASE = 'Citizen One';

export function useDocumentTitle(segment) {
  useEffect(() => {
    const title = segment ? `${segment} · ${BASE}` : BASE;
    document.title = title;
    return () => {
      document.title = BASE;
    };
  }, [segment]);
}
