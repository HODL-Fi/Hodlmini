"use client";
import React, { useEffect, useRef, useState } from "react";
import AccountPill from "./AccountPill";

export type AccountItem = {
  id: string;
  label: string;
  amount: string;
  icon?: React.ReactNode;
  emphasis?: "default" | "primary";
  verified?: boolean;
  onClick?: () => void;
  href?: string;
  iconBgClassName?: string;
};

type AccountsScrollerProps = {
  items: AccountItem[];
  className?: string;
};

export default function AccountsScroller({ items, className }: AccountsScrollerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const hasRunRef = useRef(false);
  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const moved = useRef(0);

  // Measure all pills and set max width - re-measure when items change
  useEffect(() => {
    const measurePills = () => {
      const widths = pillRefs.current
        .filter((el): el is HTMLDivElement => el !== null)
        .map(el => {
          // Temporarily remove width to measure natural size
          const originalWidth = el.style.width;
          el.style.width = '';
          const width = el.offsetWidth;
          el.style.width = originalWidth;
          return width;
        });
      
      if (widths.length > 0 && widths.some(w => w > 0)) {
        const max = Math.max(...widths);
        if (max > 0) {
          setMaxWidth(max);
        }
      }
    };

    // Initial measurement after render
    const timeout1 = setTimeout(() => {
      requestAnimationFrame(measurePills);
    }, 50);

    // Re-measure after a delay to catch loaded values
    const timeout2 = setTimeout(() => {
      requestAnimationFrame(measurePills);
    }, 500);

    // Set up ResizeObserver to re-measure when pill sizes change
    const observers: ResizeObserver[] = [];
    pillRefs.current.forEach((el) => {
      if (el) {
        const observer = new ResizeObserver(() => {
          measurePills();
        });
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      observers.forEach(obs => obs.disconnect());
    };
  }, [items]);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;

    const go = (left: number, delayMs: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          el.scrollTo({ left, behavior: "smooth" });
          // approximate duration; smooth scrolling timing isn't exposed, use a fraction of distance
          const duration = Math.min(1200, Math.max(400, Math.abs(el.scrollLeft - left)));
          setTimeout(() => resolve(), duration);
        }, delayMs);
      });

    (async () => {
      // Nudge right, then left to 0
      const target = Math.min(max, Math.floor(el.clientWidth * 0.9));
      await go(target, 250);
      await go(0, 250);
    })();
  }, []);

  return (
    <div
      ref={ref}
      className={`scrollbar-none overflow-x-auto py-2 select-none ${dragging ? "cursor-grabbing" : "cursor-grab"} ${className ?? ""}`}
      style={{ touchAction: "pan-x" }}
      onWheel={(e) => {
        const el = ref.current;
        if (!el) return;
        const canScroll = el.scrollWidth > el.clientWidth;
        if (!canScroll) return;
        // Map vertical wheel to horizontal scroll
        el.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
        e.preventDefault();
      }}
      onPointerDown={(e) => {
        const el = ref.current;
        if (!el) return;
        isDragging.current = true;
        setDragging(true);
        startX.current = e.clientX;
        startScrollLeft.current = el.scrollLeft;
        moved.current = 0;
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || !isDragging.current) return;
        const dx = e.clientX - startX.current;
        moved.current = Math.max(moved.current, Math.abs(dx));
        // Only treat as drag (and prevent click) if movement passes threshold
        if (Math.abs(dx) > 6) {
          el.scrollLeft = startScrollLeft.current - dx;
          e.preventDefault();
        }
      }}
      onPointerUp={(e) => {
        isDragging.current = false;
        setDragging(false);
      }}
      onPointerLeave={() => {
        isDragging.current = false;
        setDragging(false);
      }}
    >
      <div className="flex w-max items-stretch gap-3 pr-4">
        {items.map((it, index) => (
          <div 
            key={it.id} 
            ref={(el) => { pillRefs.current[index] = el; }}
            className="flex-shrink-0"
            style={maxWidth ? { width: `${maxWidth}px` } : undefined}
          >
          <AccountPill
            label={it.label}
            amount={it.amount}
            icon={it.icon}
            emphasis={it.emphasis}
            verified={it.verified}
            onClick={it.onClick}
            href={it.href}
            iconBgClassName={it.iconBgClassName}
          />
          </div>
        ))}
      </div>
    </div>
  );
}


