import { useLayoutEffect, useRef } from 'react';

/** Measure the shared sticky stack without moving or duplicating native page controls. */
export function useStickyHeaders() {
  const viewportRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const context = viewport.querySelector<HTMLElement>('.workspace-context-shell');
    const headers = viewport.querySelectorAll<HTMLElement>('.view-page > .page-header');
    const measure = () => {
      const contextHeight =
        context && getComputedStyle(context).position === 'sticky'
          ? context.getBoundingClientRect().height
          : 0;
      const header = viewport.querySelector<HTMLElement>('.view-page.active > .page-header');
      viewport.style.setProperty('--workspace-sticky-height', `${contextHeight}px`);
      viewport.style.setProperty(
        '--active-page-header-height',
        `${header?.getBoundingClientRect().height ?? 0}px`,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    if (context) observer.observe(context);
    headers.forEach((header) => observer.observe(header));
    measure();
    return () => {
      observer.disconnect();
      viewport.style.removeProperty('--workspace-sticky-height');
      viewport.style.removeProperty('--active-page-header-height');
    };
  }, []);
  return viewportRef;
}
