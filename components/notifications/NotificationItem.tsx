import React from "react";
import Image from "next/image";

type NotificationItemProps = {
  title: string;
  subtitle?: string;
  date: string;
  unread?: boolean;
  icon?: React.ReactNode;
  iconSrc?: string; // optional path from /public
};

export default function NotificationItem({ title, subtitle, date, unread = false, icon, iconSrc }: NotificationItemProps) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          {icon ? (
            icon
          ) : iconSrc ? (
            <Image src={iconSrc} alt="" width={22} height={22} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
              <line x1="16" y1="8" x2="23" y2="8" />
              <line x1="16" y1="13" x2="23" y2="13" />
            </svg>
          )}
        </span>
        <div className="text-left">
          <div className="text-[18px] font-semibold leading-6 text-gray-900">{title}</div>
          {subtitle ? <div className="mt-2 text-[16px] leading-5 text-gray-700">{subtitle}</div> : null}
          <div className="mt-2 text-[13px] leading-4 text-gray-500">{date}</div>
        </div>
      </div>
      <div className="mt-2">
        {unread ? <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" /> : null}
      </div>
    </div>
  );
}


