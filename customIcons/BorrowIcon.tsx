import React from "react";
import type { IconProps } from "./types";

export default function BorrowIcon({
  size = 14,
  color = "currentColor",
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.183058 0.183058C0.427136 -0.0610194 0.822864 -0.0610194 1.06694 0.183058L12.5 11.6161V3.75C12.5 3.40482 12.7798 3.125 13.125 3.125C13.4702 3.125 13.75 3.40482 13.75 3.75V13.125C13.75 13.4702 13.4702 13.75 13.125 13.75H3.75C3.40482 13.75 3.125 13.4702 3.125 13.125C3.125 12.7798 3.40482 12.5 3.75 12.5H11.6161L0.183058 1.06694C-0.0610194 0.822864 -0.0610194 0.427136 0.183058 0.183058Z"
        fill={color}
      />
    </svg>
  );
}


