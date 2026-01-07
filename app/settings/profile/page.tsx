"use client";

export const dynamic = 'force-dynamic';

import React from "react";
import Image from "next/image";
import BorrowTopNav from "@/components/BorrowTopNav";
import Modal from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { generateHandleFromUserId } from "@/utils/username";
import useGetUserProfile from "@/hooks/user/useGetUserProfile";

export default function ProfilePage() {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = React.useState(false);
  const AVATARS = React.useMemo(() => ([
    { key: "capricorn", label: "Capricorn", src: "/userdefaults/capricornn.svg" },
    { key: "scorpio", label: "Scorpio", src: "/userdefaults/scorpio.svg" },
    { key: "libra", label: "Libra", src: "/userdefaults/libra.svg" },
    { key: "sagittarius", label: "Sagittarius", src: "/userdefaults/sagittarius.svg" },
    { key: "almond", label: "Almond", src: "/userdefaults/almond.svg" },
    { key: "pantera", label: "Pantera", src: "/userdefaults/pantera.svg" },
  ]), []);
  const [selectedAvatarKey, setSelectedAvatarKey] = React.useState<string>(AVATARS[0]?.key ?? "capricorn");

  const { userId } = useAuthStore();
  const { data: profile, isLoading } = useGetUserProfile();

  // Generate fallback username from userId
  const fallbackUsername = React.useMemo(() => {
    if (!userId) return "";
    return generateHandleFromUserId(userId, "shortHex");
  }, [userId]);

  // Use API username if available, otherwise use generated one
  const displayUsername = profile?.username ?? fallbackUsername;
  const isKycVerified = profile?.kycStatus === "VERIFIED" && profile?.name;

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [userName, setUserName] = React.useState("");

  // Track initial values after data loads
  const [initial, setInitial] = React.useState({ fullName: "", email: "", userName: "" });

  // Update fields when profile data loads
  React.useEffect(() => {
    if (profile) {
      const profileEmail = profile.email || "";
      const profileName = (isKycVerified && profile.name) ? profile.name : "";
      const profileUsername = displayUsername;

      // Set current values
      setEmail(profileEmail);
      setFullName(profileName);
      setUserName(profileUsername);

      // Set initial values for dirty check
      setInitial({
        fullName: profileName,
        email: profileEmail,
        userName: profileUsername,
      });
    }
  }, [profile, displayUsername, isKycVerified]);

  const dirty = fullName !== initial.fullName || userName !== initial.userName || Boolean(avatarUrl);

  function onSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
    setAvatarPickerOpen(false);
  }

  return (
    <div className="min-h-dvh">
      <main className="px-3 text-left">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <BorrowTopNav title="Profile" showBack />
        </div>

        <section className="mt-6 text-center">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-full" style={{ background: avatarUrl ? undefined : "radial-gradient(100% 100% at 0% 0%, #2F66C5 0%, #44E06A 100%)" }}>
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-gray-200 px-5 py-3 text-[16px] font-semibold text-gray-800"
              onClick={() => setAvatarPickerOpen(true)}
            >
              Select avatar
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onSelectAvatar} />
          </div>
        </section>

        <section className="mx-auto mt-6 max-w-[560px] space-y-5">
          {isKycVerified && (
            <div>
              <div className="text-[14px] text-gray-600">Full name</div>
              <input
                value={fullName}
                onChange={(e)=>setFullName(e.target.value)}
                className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[16px] outline-none"
                placeholder={isLoading ? "Loading..." : ""}
              />
            </div>
          )}
          <div>
            <div className="text-[14px] text-gray-600">Email</div>
            <input
              value={email}
              className="mt-2 w-full rounded-[14px] border border-gray-200 bg-gray-50 px-3 py-3 text-[16px] outline-none cursor-not-allowed"
              readOnly
              disabled
              placeholder={isLoading ? "Loading..." : ""}
            />
          </div>
          <div>
            <div className="text-[14px] text-gray-600">Username</div>
            <input
              value={userName}
              onChange={(e)=>setUserName(e.target.value)}
              className="mt-2 w-full rounded-[14px] border border-gray-200 bg-white px-3 py-3 text-[16px] outline-none"
              placeholder={isLoading ? "Loading..." : ""}
            />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
          <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <button
              type="button"
              disabled={!dirty}
              className={`w-full rounded-[20px] px-4 py-4 text-[16px] font-semibold ${dirty ? "bg-[#2200FF] text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              onClick={() => { /* stub save */ }}
            >
              Save changes
            </button>
          </div>
        </div>
      </main>

      {/* Avatar Picker */}
      <Modal open={avatarPickerOpen} onClose={() => setAvatarPickerOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="text-[24px] font-semibold leading-6">Select avatar</div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setAvatarPickerOpen(false)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            {AVATARS.map((a) => {
              const active = selectedAvatarKey === a.key;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setSelectedAvatarKey(a.key)}
                  className="group text-center"
                >
                  <div className={`relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ${active ? "ring-[#2200FF]" : "ring-transparent"}`}>
                    <Image src={a.src} alt={a.label} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="mt-2 text-[14px] text-gray-800">{a.label}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            <button
              type="button"
              className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
              onClick={() => {
                const chosen = AVATARS.find(a => a.key === selectedAvatarKey);
                if (chosen) setAvatarUrl(chosen.src);
                setAvatarPickerOpen(false);
              }}
            >
              Select
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


