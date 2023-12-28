import { DependencyList, useEffect, useMemo, useRef, useState } from 'react';

export function useElementHeight<T extends HTMLElement = any>(dependencies: DependencyList = []) {
  const frameID = useRef(0);
  const ref = useRef<T>(null);

  const [height, setHeight] = useState(0);

  const observer = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new ResizeObserver((entries: any) => {
            const entry = entries[0];
            if (entry) {
              cancelAnimationFrame(frameID.current);

              frameID.current = requestAnimationFrame(() => {
                if (ref.current) {
                  if (entry.contentRect.height !== height) {
                    setHeight(entry.contentRect.height);
                  }
                }
              });
            }
          })
        : null,
    [],
  );

  useEffect(() => {
    if (ref.current) {
      observer?.observe(ref.current);
      setHeight(ref.current.getBoundingClientRect().height);
    }

    return () => {
      observer?.disconnect();

      if (frameID.current) {
        cancelAnimationFrame(frameID.current);
      }
    };
  }, [ref.current, observer, ...dependencies]);
  return { ref, height };
}
