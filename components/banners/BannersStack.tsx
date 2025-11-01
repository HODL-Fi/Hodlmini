"use client";
import React, { useEffect, useMemo, useState } from "react";
import BannerCard from "./BannerCard";

type BannersStackProps = {
  className?: string;
};

export default function BannersStack({ className }: BannersStackProps) {
  const [show, setShow] = useState(false);
  const [topIndex, setTopIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(id);
  }, []);

  const items = [
    {
      key: "earn",
      title: "Earn better",
      description: "Lock your interest for an extended period to earn on your interest",
      cta: "Try it out",
      icon: "/icons/lock.svg",
      bg: "bg-[#FFF7D6]",
      text: "text-[#6C5A1A]",
    },
    {
      key: "convert",
      title: "Convert instantly",
      description: "Swap assets with zero friction and transparent quotes",
      cta: "Convert now",
      icon: "/icons/convert.svg",
      bg: "bg-[#F1F5FF]",
      text: "text-[#27304D]",
    },
  ];

  const baseHeight = 148; // px - card visual height for the stack container

  const ordered = useMemo(() => {
    const out: typeof items = [];
    for (let i = 0; i < items.length; i++) {
      out.push(items[(topIndex + i) % items.length]);
    }
    return out;
  }, [items, topIndex]);

  const handleFlip = () => {
    if (animating) return;
    setAnimating(true);
    // Animate current stack first, then rotate order
    setTimeout(() => {
      setTopIndex((i) => (i + 1) % items.length);
      setAnimating(false);
    }, 650);
  };

  return (
    <div
      className={`relative ${className ?? ""} select-none`}
      style={{ height: baseHeight }}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleFlip();
      }}
    >
      {ordered.map((it, pos) => {
        const finalTranslate = pos === 0 ? 0 : -pos * 12; // steady stacked positions (top overlap)
        const initialTranslate = (pos + 1) * -24; // slide up on first mount

        // During flip animation: top card slides further up/tilts/fades; others move up one slot
        const flipTranslate = pos === 0 ? -40 : -(pos - 1) * 12;
        const flipRotate = pos === 0 ? -6 : 0; // degrees
        const flipScale = pos === 0 ? 0.98 : 1;

        // Compute transform based on state
        let transform = `translateY(${finalTranslate}px) scale(1)`;
        let opacity = 1;
        if (!show) {
          transform = `translateY(${initialTranslate}px) scale(0.98)`;
          opacity = 0;
        } else if (animating) {
          transform = `translateY(${flipTranslate}px) scale(${flipScale}) rotate(${flipRotate}deg)`;
          if (pos === 0) opacity = 0; // top card fades out as it flips away
        }

        const z = animating && pos === 0 ? items.length + 1 : items.length - pos; // keep top above during flip

        return (
          <div key={`${it.key}-${pos}`} className="absolute inset-x-0 top-0" style={{ zIndex: z }}>
            <div
              className="transition-all ease-out"
              style={{
                transitionDuration: animating ? "650ms" : "700ms",
                transform,
                opacity,
                willChange: "transform, opacity",
              }}
            >
              <BannerCard
                title={it.title}
                description={it.description}
                ctaLabel={it.cta}
                iconSrc={it.icon}
                className={`${it.bg} ${pos === 0 ? "cursor-pointer" : "cursor-default"}`}
                textClassName={`${it.text}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}


