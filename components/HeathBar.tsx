import React from "react";

type HealthBarProps = {
  percentage: number;
};

const HealthBar: React.FC<HealthBarProps> = ({ percentage }) => {
  const safe = Math.max(0, Math.min(100, percentage));
  const { label, range, color } = React.useMemo(() => {
    if (safe < 50) return { label: "Safe", range: "0–50%", color: "#008000" };
    if (safe < 80) return { label: "Moderate", range: "50–80%", color: "#FCC61D" };
    return { label: "Liquidation risk", range: "80–100%", color: "#ff0000" };
  }, [safe]);
  return (
    <div>
      <div className="relative h-2 w-full rounded-full overflow-hidden bg-[#191818]">
        {/* Full gradient background */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,_#008000,_#ffff00,_#ff0000)]" />
        {/* Mask covering unfilled portion */}
        <div
          className="absolute top-0 right-0 h-full bg-[#191818] transition-all duration-500"
          style={{ width: `${100 - safe}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px]">
        <span style={{ color, fontSize: 16, fontWeight: 600 }}>{label}</span>
        <span className="tabular-nums text-gray-700 opacity-0">{range}</span>
      </div>
    </div>
  );
};

export default HealthBar;


