import React from "react";
import type { IconProps } from "./types";

export default function EarnIcon({
  size = 18,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path
        d="M0.75 10.303L6.375 4.678L9.96369 8.26669C10.9668 6.2931 12.6285 4.63825 14.8085 3.66762L17.0924 2.65078M17.0924 2.65078L12.1414 0.750244M17.0924 2.65078L15.1919 7.60184"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


