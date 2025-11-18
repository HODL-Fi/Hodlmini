"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    // Show splash for 2.5 seconds, then redirect to onboarding
    const timer = setTimeout(() => {
      setShowSplash(false);
      router.push("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  if (showSplash) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-[#2200FF] z-[9999]"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0
        }}
      >
        <Image
          src="/logos/HODL_Primary_White.svg"
          alt="HODL"
          width={400}
          height={92}
          priority
          className="w-[70%] max-w-[400px] h-auto"
        />
      </div>
    );
  }

  return null;
}
