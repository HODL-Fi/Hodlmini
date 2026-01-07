"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type FontOption = {
  id: string;
  name: string;
  cssVariable: string;
  className: string;
};

export const availableFonts: FontOption[] = [
  { id: "clash", name: "Clash Display", cssVariable: "--font-clash", className: "font-[family-name:var(--font-clash)]" },
  { id: "geist", name: "Geist Sans", cssVariable: "--font-geist-sans", className: "font-[family-name:var(--font-geist-sans)]" },
  { id: "inter", name: "Inter", cssVariable: "--font-inter", className: "font-[family-name:var(--font-inter)]" },
  { id: "poppins", name: "Poppins", cssVariable: "--font-poppins", className: "font-[family-name:var(--font-poppins)]" },
  { id: "roboto", name: "Roboto", cssVariable: "--font-roboto", className: "font-[family-name:var(--font-roboto)]" },
  { id: "open-sans", name: "Open Sans", cssVariable: "--font-open-sans", className: "font-[family-name:var(--font-open-sans)]" },
  { id: "lato", name: "Lato", cssVariable: "--font-lato", className: "font-[family-name:var(--font-lato)]" },
  { id: "montserrat", name: "Montserrat", cssVariable: "--font-montserrat", className: "font-[family-name:var(--font-montserrat)]" },
  { id: "raleway", name: "Raleway", cssVariable: "--font-raleway", className: "font-[family-name:var(--font-raleway)]" },
  { id: "nunito", name: "Nunito", cssVariable: "--font-nunito", className: "font-[family-name:var(--font-nunito)]" },
  { id: "playfair", name: "Playfair Display", cssVariable: "--font-playfair", className: "font-[family-name:var(--font-playfair)]" },
  { id: "merriweather", name: "Merriweather", cssVariable: "--font-merriweather", className: "font-[family-name:var(--font-merriweather)]" },
  { id: "source-sans", name: "Source Sans 3", cssVariable: "--font-source-sans", className: "font-[family-name:var(--font-source-sans)]" },
  { id: "work-sans", name: "Work Sans", cssVariable: "--font-work-sans", className: "font-[family-name:var(--font-work-sans)]" },
  { id: "dm-sans", name: "DM Sans", cssVariable: "--font-dm-sans", className: "font-[family-name:var(--font-dm-sans)]" },
  { id: "plus-jakarta", name: "Plus Jakarta Sans", cssVariable: "--font-plus-jakarta", className: "font-[family-name:var(--font-plus-jakarta)]" },
  { id: "manrope", name: "Manrope", cssVariable: "--font-manrope", className: "font-[family-name:var(--font-manrope)]" },
  { id: "space-grotesk", name: "Space Grotesk", cssVariable: "--font-space-grotesk", className: "font-[family-name:var(--font-space-grotesk)]" },
  { id: "outfit", name: "Outfit", cssVariable: "--font-outfit", className: "font-[family-name:var(--font-outfit)]" },
  { id: "sora", name: "Sora", cssVariable: "--font-sora", className: "font-[family-name:var(--font-sora)]" },
];

type FontContextType = {
  selectedFont: FontOption;
  setSelectedFont: (font: FontOption) => void;
  availableFonts: FontOption[];
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  // const [selectedFont, setSelectedFontState] = useState<FontOption>(availableFonts[0]); // Default to Clash Display

  // // Load font preference from localStorage on mount
  // useEffect(() => {
  //   const savedFontId = localStorage.getItem("selectedFontId");
  //   if (savedFontId) {
  //     const font = availableFonts.find((f) => f.id === savedFontId);
  //     if (font) {
  //       setSelectedFontState(font);
  //     }
  //   }
  // }, []);

  const [selectedFont, setSelectedFontState] = useState<FontOption>(() => {
    if (typeof window !== "undefined") {
      const savedFontId = localStorage.getItem("selectedFontId");
      const font = availableFonts.find((f) => f.id === savedFontId);
      if (font) return font;
    }
    return availableFonts[0];
  });

  // Update body font when selectedFont changes
  useEffect(() => {
    // Set the CSS variable that will be used in globals.css
    document.documentElement.style.setProperty("--font-family-primary", `var(${selectedFont.cssVariable})`);
    // Also directly set on body for immediate effect
    document.body.style.fontFamily = `var(${selectedFont.cssVariable}), Arial, Helvetica, sans-serif`;
    localStorage.setItem("selectedFontId", selectedFont.id);
  }, [selectedFont]);

  const setSelectedFont = (font: FontOption) => {
    setSelectedFontState(font);
  };

  return (
    <FontContext.Provider value={{ selectedFont, setSelectedFont, availableFonts }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}

