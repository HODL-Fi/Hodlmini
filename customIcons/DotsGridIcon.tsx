import React from "react";
import type { IconProps } from "./types";

export default function DotsGridIcon({ size = 18, color = "currentColor", className, ...props }: IconProps) {
  const r = 1.5;
  const dots = [
    [5, 5], [12, 5], [19, 5],
    [5, 12], [12, 12], [19, 12],
    [5, 19], [12, 19], [19, 19],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden={props["aria-label"] ? undefined : true} {...props}>
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={color} />
      ))}
    </svg>
  );
}


