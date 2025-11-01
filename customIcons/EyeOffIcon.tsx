import React from "react";
import type { IconProps } from "./types";

export default function EyeOffIcon({
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
      <path d="M3 3l18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.584 10.587a3 3 0 104.243 4.243" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.88 5.08A9.953 9.953 0 0121 12c-2.4 3.6-5.6 6-9 6a9.953 9.953 0 01-5.12-1.44" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.61 6.61A9.955 9.955 0 003 12c2.4 3.6 5.6 6 9 6 .86 0 1.695-.115 2.494-.334" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


