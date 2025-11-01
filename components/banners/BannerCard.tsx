import Image from "next/image";
import React from "react";

type BannerCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  iconSrc: string; // from /public, e.g. "/icons/lock.svg"
  onClick?: () => void;
  className?: string;
  textClassName?: string;
};

export default function BannerCard({
  title,
  description,
  ctaLabel,
  iconSrc,
  onClick,
  className,
  textClassName,
}: BannerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-start justify-between overflow-hidden rounded-2xl border border-black/5 p-4 text-left shadow-sm ${className ?? ""}`}
    >
      <div className={`z-[1] max-w-[70%] ${textClassName ?? ""}`}>
        <div className="text-[18px] font-semibold leading-6">{title}</div>
        <div className="mt-2 text-[14px] leading-5 opacity-90">
          {description}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 underline underline-offset-2">
          {ctaLabel}
          <span aria-hidden>→</span>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-2 bottom-0 translate-y-20 select-none" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(0)", willChange: "transform" }}>
        <Image src={iconSrc} alt="" width={180} height={180} priority loading="eager" draggable={false} sizes="(max-width: 560px) 180px, 180px" />
      </div>
    </button>
  );
}


