"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

type VisibilityContextValue = {
  hidden: boolean;
  setHidden: (v: boolean) => void;
  toggle: () => void;
};

const VisibilityContext = createContext<VisibilityContextValue | null>(null);

export function VisibilityProvider({ children, defaultHidden = false }: { children: React.ReactNode; defaultHidden?: boolean }) {
  const [hidden, setHidden] = useState<boolean>(defaultHidden);
  const value = useMemo<VisibilityContextValue>(() => ({ hidden, setHidden, toggle: () => setHidden((v) => !v) }), [hidden]);
  return <VisibilityContext.Provider value={value}>{children}</VisibilityContext.Provider>;
}

export function useVisibility(): VisibilityContextValue {
  const ctx = useContext(VisibilityContext);
  if (!ctx) throw new Error("useVisibility must be used within VisibilityProvider");
  return ctx;
}


