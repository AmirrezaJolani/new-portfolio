"use client";

import { useCallback, useRef } from "react";

interface UseDragOptions {
  onDrag: (dx: number, dy: number) => void;
  onStart?: () => void;
}

/**
 * Pointer-events drag. Reports frame-batched deltas from the drag origin.
 * Works for both window moving and resizing (caller applies the delta).
 */
export function useDrag({ onDrag, onStart }: UseDragOptions) {
  const frame = useRef<number | null>(null);
  const pending = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      onStart?.();
      const startX = e.clientX;
      const startY = e.clientY;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const flush = () => {
        frame.current = null;
        if (pending.current) {
          onDrag(pending.current.dx, pending.current.dy);
          pending.current = null;
        }
      };

      const onMove = (ev: PointerEvent) => {
        pending.current = { dx: ev.clientX - startX, dy: ev.clientY - startY };
        if (frame.current === null) {
          frame.current = requestAnimationFrame(flush);
        }
      };

      const onUp = (ev: PointerEvent) => {
        target.releasePointerCapture(ev.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        pending.current = null;
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
    },
    [onDrag, onStart],
  );

  return { onPointerDown };
}
