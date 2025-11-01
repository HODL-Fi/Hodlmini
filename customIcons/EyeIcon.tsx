import React from "react";
import type { IconProps } from "./types";

export default function EyeIcon({
  size = 16,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}


