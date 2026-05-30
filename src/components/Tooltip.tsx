import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  wide?: boolean;
  /** Render via portal so parent overflow cannot clip the tooltip */
  portal?: boolean;
  placement?: 'top' | 'bottom';
}

export function Tooltip({
  content,
  children,
  wide,
  portal = false,
  placement = 'top',
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);

  const updatePosition = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: placement === 'top' ? rect.top : rect.bottom,
    });
  }, [placement]);

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

  const tooltipClass = [
    'tooltip',
    wide ? 'tooltip--wide' : '',
    portal ? 'tooltip--portal' : '',
    portal ? `tooltip--portal-${placement}` : '',
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
      <span className={tooltipClass} role="tooltip">
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
      {!portal && tooltipNode}
      {portal && tooltipNode}
    </span>
  );
}
