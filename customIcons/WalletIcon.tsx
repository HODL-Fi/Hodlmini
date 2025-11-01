import React from "react";
import type { IconProps } from "./types";

export default function WalletIcon({
  size = 17,
  color = "currentColor",
  strokeWidth = 1.5,
  variant = "outline",
  className,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {variant === "filled" ? (
        // Provided filled wallet uses 17x15; center it within 17x16 viewBox
        <g transform="translate(0,0.5)">
          <path d="M0.0192261 2.1877C0.680316 1.60411 1.54876 1.25 2.49991 1.25H13.7499C14.7011 1.25 15.5695 1.60412 16.2306 2.1877C16.0769 0.954379 15.0249 0 13.7499 0H2.49991C1.22496 0 0.17292 0.954379 0.0192261 2.1877Z" fill={color} />
          <path d="M0.0192261 4.6877C0.680316 4.10411 1.54876 3.75 2.49991 3.75H13.7499C14.7011 3.75 15.5695 4.10412 16.2306 4.6877C16.0769 3.45438 15.0249 2.5 13.7499 2.5H2.49991C1.22496 2.5 0.17292 3.45438 0.0192261 4.6877Z" fill={color} />
          <path d="M2.5 5C1.11929 5 0 6.11929 0 7.5V12.5C0 13.8807 1.11929 15 2.5 15H13.75C15.1307 15 16.25 13.8807 16.25 12.5V7.5C16.25 6.11929 15.1307 5 13.75 5H10.625C10.2798 5 10 5.27982 10 5.625C10 6.66053 9.16053 7.5 8.125 7.5C7.08947 7.5 6.25 6.66053 6.25 5.625C6.25 5.27982 5.97018 5 5.625 5H2.5Z" fill={color} />
        </g>
      ) : (
        <path
          d="M15.75 7.625C15.75 6.58947 14.9105 5.75 13.875 5.75H10.75C10.75 7.13071 9.63071 8.25 8.25 8.25C6.86929 8.25 5.75 7.13071 5.75 5.75H2.625C1.58947 5.75 0.75 6.58947 0.75 7.625M15.75 7.625V12.625C15.75 13.6605 14.9105 14.5 13.875 14.5H2.625C1.58947 14.5 0.75 13.6605 0.75 12.625V7.625M15.75 7.625V5.125M0.75 7.625V5.125M15.75 5.125C15.75 4.08947 14.9105 3.25 13.875 3.25H2.625C1.58947 3.25 0.75 4.08947 0.75 5.125M15.75 5.125V2.625C15.75 1.58947 14.9105 0.75 13.875 0.75H2.625C1.58947 0.75 0.75 1.58947 0.75 2.625V5.125"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}


