import React from "react";
import type { IconProps } from "./types";

export default function HomeIcon({
  size = 18,
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
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {variant === "filled" ? (
        // Provided filled path is 16x16; scale to 18x18 to keep alignment/size
        <g transform="scale(1.125)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.29292 0.292893C7.68345 -0.0976311 8.31661 -0.0976311 8.70714 0.292893L15.7071 7.29289C15.9931 7.57889 16.0787 8.00901 15.9239 8.38268C15.7691 8.75636 15.4045 9 15 9H14V15C14 15.5523 13.5523 16 13 16H11C10.4477 16 10 15.5523 10 15V12C10 11.4477 9.55231 11 9.00003 11H7.00003C6.44774 11 6.00003 11.4477 6.00003 12V15C6.00003 15.5523 5.55231 16 5.00003 16H3.00003C2.44774 16 2.00003 15.5523 2.00003 15V9H1.00003C0.595567 9 0.230931 8.75636 0.0761497 8.38268C-0.0786313 8.00901 0.00692445 7.57889 0.292922 7.29289L7.29292 0.292893Z"
            fill={color}
          />
        </g>
      ) : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.04295 1.04289C8.43347 0.652369 9.06664 0.652369 9.45716 1.04289L16.4572 8.04289C16.7432 8.32889 16.8287 8.75901 16.6739 9.13268C16.5192 9.50636 16.1545 9.75 15.7501 9.75H14.7501V15.75C14.7501 16.3023 14.3023 16.75 13.7501 16.75H11.7501C11.1978 16.75 10.7501 16.3023 10.7501 15.75V12.75C10.7501 12.1977 10.3023 11.75 9.75005 11.75H7.75005C7.19777 11.75 6.75005 12.1977 6.75005 12.75V15.75C6.75005 16.3023 6.30234 16.75 5.75005 16.75H3.75005C3.19777 16.75 2.75005 16.3023 2.75005 15.75V9.75H1.75005C1.34559 9.75 0.980954 9.50636 0.826173 9.13268C0.671392 8.75901 0.756947 8.32889 1.04295 8.04289L8.04295 1.04289Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}


