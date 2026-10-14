import { useEffect, RefObject } from 'react';

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null> | Array<RefObject<T | null>>,
  handler: (event: Event) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    let timer: number;
    const listener = (event: Event) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      const isInside = refs.some(r => r.current && r.current.contains(event.target as Node));
      if (isInside) {
        return;
      }
      handler(event);
    };

    // Delay attaching event listeners slightly so the click/tap that opens the component doesn't immediately trigger close
    timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', listener);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', listener);
    };
  }, [ref, handler, enabled]);
}
