import React from "react";
import type { IconProps } from "./types";

export default function ArrowLeftIcon({ size = 18, color = "currentColor", strokeWidth = 1.8, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden={props["aria-label"] ? undefined : true} {...props}>
      <path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


