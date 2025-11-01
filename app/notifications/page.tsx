"use client";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import NotificationItem from "@/components/notifications/NotificationItem";
import { ArrowLeftIcon } from "@customIcons";

export default function NotificationsPage() {
  const router = useRouter();
  const items = [
    {
      id: "1",
      title: "₦400,000 was sent to Ibrahim Giwa for a 100kg of Sorghum",
      date: "Jun 17; 8:28am",
      unread: true,
      iconSrc: "/icons/truck.svg",
    },
    {
      id: "2",
      title: "Your order is on the way.",
      subtitle: "This is your 6–digit OTP code to confirm your product.\n759122",
      date: "Jun 17; 8:28am",
      unread: true,
      iconSrc: "/icons/key.svg",
    },
    {
      id: "3",
      title: "₦700,000 was sent to Randy Efua for a 100kg of Local Rice",
      date: "Jun 17; 8:28am",
      unread: false,
      iconSrc: "/icons/truck.svg",
    },
  ];

  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title={`Notifications (${items.length})`}
        fixed
        left={
          <button onClick={() => router.back()} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </button>
        }
        right={
          <button type="button" className="text-[14px] text-gray-600 underline underline-offset-2 cursor-pointer">
            Mark all as read
          </button>
        }
      />

      <div className="mt-3 space-y-3">
        {items.map((n) => (
          <NotificationItem key={n.id} title={n.title} subtitle={n.subtitle} date={n.date} unread={n.unread} iconSrc={n.iconSrc} />
        ))}
      </div>
    </div>
  );
}


