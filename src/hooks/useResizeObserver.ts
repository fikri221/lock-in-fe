import { useState, useCallback, useRef } from "react";

interface ResizeObserverEntry {
  target: Element;
  contentRect: DOMRectReadOnly;
}

export const useResizeObserver = <T extends HTMLElement>() => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    // If we have an existing observer, disconnect it
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // If the node is null (unmounted), we're done
    if (node === null) return;

    // Create a new observer for the new node
    observerRef.current = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        if (!entries || entries.length === 0) return;
        const entry = entries[0];
        // Use contentRect for precise content box dimensions
        setWidth(entry.contentRect.width);
        setHeight(entry.contentRect.height);
      },
    );

    observerRef.current.observe(node);
  }, []);

  return { ref, width, height };
};
