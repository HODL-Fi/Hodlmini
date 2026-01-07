"use client";

import React from "react";

type CountryCode = string; // ISO 3166-1 alpha-2

type Country = { code: CountryCode; name: string };

type CountrySelectProps = {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
};

const FLAG_CODES_ENDPOINT = "https://flagcdn.com/en/codes.json";

function codeToFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  const base = 127397;
  const upper = code.toUpperCase();
  return String.fromCodePoint(upper.charCodeAt(0) + base) + String.fromCodePoint(upper.charCodeAt(1) + base);
}

export default function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(FLAG_CODES_ENDPOINT);
        const data = (await res.json()) as Record<string, string>;
        if (!mounted) return;
        const list = Object.entries(data)
          .map(([code, name]) => ({ code, name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(list);
      } catch {
        // Fallback subset if fetch fails
        setCountries([
          { code: "ng", name: "Nigeria" },
          { code: "ke", name: "Kenya" },
          { code: "gh", name: "Ghana" },
          { code: "za", name: "South Africa" },
          { code: "us", name: "United States" },
          { code: "gb", name: "United Kingdom" },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selected = React.useMemo(() => countries.find(c => c.code === value) || null, [countries, value]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countries, query]);

  React.useEffect(() => {
    if (open) {
      // focus search on open
      setTimeout(() => searchRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[14px]"
      >
        <span className="text-[14px]">
          {selected ? codeToFlagEmoji(selected.code) : "🌐"}
        </span>
        <span className="text-[14px] text-gray-900 min-w-[60px] text-left">
          {selected ? selected.name : loading ? "Loading..." : "Select"}
        </span>
        <span aria-hidden="true" className="text-gray-500 text-[10px]">▾</span>
      </button>

      {open ? (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 z-10 mt-1 max-h-72 w-[260px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-md"
        >
          <div className="sticky top-0 z-10 bg-white px-3 pt-2 pb-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country"
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-[13px] outline-none focus:ring-2 focus:ring-[#2200FF]/20 focus:border-[#2200FF]"
            />
          </div>

          {filtered.map((c) => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === value}
              onClick={() => {
                onChange(c.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-[14px] text-left hover:bg-gray-50 ${c.code === value ? "bg-gray-50" : ""}`}
            >
              <span className="text-[16px]">{codeToFlagEmoji(c.code)}</span>
              <span className="text-gray-900">{c.name}</span>
            </button>
          ))}
          {!filtered.length && !loading ? (
            <div className="px-3 py-2 text-[13px] text-gray-500">No countries</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

