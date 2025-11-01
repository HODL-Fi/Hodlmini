import React from "react";
import type { IconProps } from "./types";

export default function BellIcon({
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
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path
        d="M10.057 12.4848C11.6358 12.2975 13.1582 11.9263 14.6022 11.3932C13.4049 10.0642 12.6761 8.3047 12.6761 6.375V5.79099C12.6762 5.77734 12.6763 5.76368 12.6763 5.75C12.6763 2.98858 10.4377 0.75 7.67627 0.75C4.91485 0.75 2.67627 2.98858 2.67627 5.75L2.6761 6.375C2.6761 8.3047 1.94733 10.0642 0.75 11.3932C2.19411 11.9263 3.71663 12.2975 5.29555 12.4848M10.057 12.4848C9.27626 12.5774 8.48174 12.625 7.67611 12.625C6.87058 12.625 6.07617 12.5774 5.29555 12.4848M10.057 12.4848C10.1344 12.7259 10.1763 12.9831 10.1763 13.25C10.1763 14.6307 9.05698 15.75 7.67627 15.75C6.29556 15.75 5.17627 14.6307 5.17627 13.25C5.17627 12.9831 5.2181 12.726 5.29555 12.4848"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


