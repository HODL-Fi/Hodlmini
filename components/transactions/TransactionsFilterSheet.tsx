"use client";
import React from "react";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (data: { types: string[]; statuses: string[]; range: string | null }) => void;
  defaultTypes?: string[];
  defaultStatuses?: string[];
  defaultRange?: string | null;
};

export default function TransactionsFilterSheet({ open, onClose, onApply, defaultTypes = ["borrow", "repay"], defaultStatuses = ["success", "pending", "failed"], defaultRange = null }: Props) {
  const [types, setTypes] = React.useState<string[]>(defaultTypes);
  const [statuses, setStatuses] = React.useState<string[]>(defaultStatuses);
  const [range, setRange] = React.useState<string | null>(defaultRange);

  React.useEffect(() => {
    if (open) {
      setTypes(defaultTypes);
      setStatuses(defaultStatuses);
      setRange(defaultRange);
    }
  }, [open, defaultTypes, defaultStatuses, defaultRange]);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const chip = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`${active ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-700"} rounded-full px-4 py-2 text-[14px] cursor-pointer`}
    >
      {label}
      {active ? <span className="ml-2">×</span> : null}
    </button>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[18px] font-semibold">Set filter</div>
        <button
          type="button"
          onClick={() => {
            onApply({ types, statuses, range });
            onClose();
          }}
          className="rounded-full bg-gray-100 px-3 py-1 text-[12px] cursor-pointer"
        >
          Set Filter
        </button>
      </div>

      <div className="space-y-4">
        <section className="rounded-xl bg-gray-50 p-3">
          <div className="text-[16px] font-medium">Transaction type</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chip(types.includes("borrow"), "Money borrowed", () => toggle(types, "borrow", setTypes))}
            {chip(types.includes("repay"), "Loan repaid", () => toggle(types, "repay", setTypes))}
          </div>
        </section>

        <section className="rounded-xl bg-gray-50 p-3">
          <div className="text-[16px] font-medium">Status</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chip(statuses.includes("success"), "Success", () => toggle(statuses, "success", setStatuses))}
            {chip(statuses.includes("pending"), "Pending", () => toggle(statuses, "pending", setStatuses))}
            {chip(statuses.includes("failed"), "Failed", () => toggle(statuses, "failed", setStatuses))}
          </div>
        </section>

        <section className="rounded-xl bg-gray-50 p-3">
          <div className="text-[16px] font-medium">Time range</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* All time (null) */}
            <button
              type="button"
              onClick={() => setRange(null)}
              className={`${range === null ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-700"} rounded-full px-4 py-2 text-[14px] cursor-pointer`}
            >
              All time
            </button>
            {[
              "Last 24hrs",
              "Last 7 days",
              "Last 30 days",
              "Last 90 days",
              "Last 360 days",
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setRange(range === label ? null : label)}
                className={`${range === label ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-700"} rounded-full px-4 py-2 text-[14px] cursor-pointer`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}


