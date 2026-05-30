import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  wide?: boolean;
  /** Render via portal so parent overflow cannot clip the tooltip */
  portal?: boolean;
  placement?: 'top' | 'bottom' | 'auto';
}

const VIEWPORT_PAD = 12;

export function Tooltip({
  content,
  children,
  wide,
  portal = false,
  placement = 'top',
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [resolvedPlacement, setResolvedPlacement] = useState<'top' | 'bottom'>(
    placement === 'bottom' ? 'bottom' : 'top',
  );
  const wrapRef = useRef<HTMLSpanElement>(null);

  const resolvePlacement = useCallback(
    (rect: DOMRect): 'top' | 'bottom' => {
      if (placement === 'top') return 'top';
      if (placement === 'bottom') return 'bottom';
      const spaceAbove = rect.top - VIEWPORT_PAD;
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
      const minNeeded = wide ? 120 : 80;
      if (spaceAbove >= minNeeded) return 'top';
      if (spaceBelow >= minNeeded) return 'bottom';
      return spaceBelow >= spaceAbove ? 'bottom' : 'top';
    },
    [placement, wide],
  );

  const updatePosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const resolved = resolvePlacement(rect);
    setResolvedPlacement(resolved);
    setCoords({
      x: rect.left + rect.width / 2,
      y: resolved === 'top' ? rect.top : rect.bottom,
    });
  }, [resolvePlacement]);

  useEffect(() => {
    if (!show || !portal) return;
    updatePosition();
    const onMove = () => updatePosition();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [show, portal, updatePosition]);

  const open = () => {
    updatePosition();
    setShow(true);
  };

  const effectivePlacement = portal ? resolvedPlacement : placement === 'auto' ? 'top' : placement;

  const tooltipClass = [
    'tooltip',
    wide ? 'tooltip--wide' : '',
    portal ? 'tooltip--portal' : '',
    portal ? `tooltip--portal-${resolvedPlacement}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tooltipNode = show ? (
    portal ? (
      createPortal(
        <span
          className={tooltipClass}
          style={{ left: coords.x, top: coords.y }}
          role="tooltip"
        >
          {content}
        </span>,
        document.body,
      )
    ) : (
      <span
        className={[
          'tooltip',
          wide ? 'tooltip--wide' : '',
          effectivePlacement === 'bottom' ? 'tooltip--bottom' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="tooltip"
      >
        {content}
      </span>
    )
  ) : null;

  return (
    <span
      ref={wrapRef}
      className="tooltip-wrap"
      onMouseEnter={open}
      onMouseLeave={() => setShow(false)}
      onFocus={open}
      onBlur={() => setShow(false)}
    >
      {children}
      {tooltipNode}
    </span>
  );
}
