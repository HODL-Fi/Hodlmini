import React from "react";

type AppHeaderProps = {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  fixed?: boolean;
};

export default function AppHeader({ title = "Hodl Mini", left, right, fixed = false }: AppHeaderProps) {
  const positionClass = fixed
    ? "fixed top-0 left-1/2 z-20 -translate-x-1/2 w-full max-w-[560px]"
    : "sticky top-0 z-10";
  return (
    <header className={`${positionClass} bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60`}>
      <div className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-3">
          {left}
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
        <div className="min-w-4">{right}</div>
      </div>
    </header>
  );
}


