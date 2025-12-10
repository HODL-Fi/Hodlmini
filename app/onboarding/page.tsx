/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useGoogleSignInAPI } from "@/hooks/auth/useGoogleSignInAPI";

type Slide = {
  key: string;
  titleLines: string[];
  imageSrc: string;
  imageAlt: string;
};

const SLIDES: Slide[] = [
  {
    key: "cash",
    titleLines: ["Cash", "When", "Needed"],
    imageSrc: "/onboard/1.svg",
    imageAlt: "Cash when needed",
  },
  {
    key: "crypto",
    titleLines: ["Use", "Crypto", "Power"],
    imageSrc: "/onboard/2.svg",
    imageAlt: "Use crypto power",
  },
  {
    key: "grow",
    titleLines: ["Grow", "Your", "Assets"],
    imageSrc: "/onboard/3.svg",
    imageAlt: "Grow your assets",
  },
  {
    key: "unlock",
    titleLines: ["Unlock", "Instant", "Credit"],
    imageSrc: "/onboard/4.svg",
    imageAlt: "Unlock instant credit",
  },
];

export default function OnboardingPage() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = React.useState(true);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const autoAdvanceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScrollRef = React.useRef(false);

  const router = useRouter();

  const goToSignup = () => {
    router.push("/auth?mode=signup");
  };

  const goToSignin = () => {
    router.push("/auth?mode=signin");
  };


  const { web3Auth } = useWeb3Auth();
  const  {mutateAsync:googleLoginUser}  = useGoogleSignInAPI();

 const handleLogin = async () => {
  const { setLoading, setError, setAuth } = useAuthStore.getState();

  try {
    setLoading(true);
    setError(null);

    await web3Auth?.connect();

    const identity = await web3Auth?.getUserInfo();
    const idToken = identity?.oAuthIdToken;

    if (!idToken) throw new Error("Failed to retrieve Google ID token");

    console.log("Google ID Token:", idToken);

    // Step 3: Call backend with ID Token
    const res = await googleLoginUser({
      idToken,
      country: "ng",         // optional
      referralCode: ""        // optional
    });

    console.log("Backend login:", res);

    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    setAuth({
      userId: res.userId,
      evmAddress: res.evmAddress,
      country: "ng",
      idToken,
    });

    router.push("/home");

  } catch (err: any) {
    console.error(err);
    setError(err?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  // Function to scroll to a specific slide
  const scrollToSlide = React.useCallback((index: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    const targetIndex = Math.max(0, Math.min(index, SLIDES.length - 1));
    const scrollPosition = targetIndex * node.clientWidth;
    isProgrammaticScrollRef.current = true;
    node.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    setActiveIndex(targetIndex);
    setAutoAdvanceEnabled(false); // Stop auto-advance on user interaction
  }, []);

  // Auto-advance slides
  React.useEffect(() => {
    if (!autoAdvanceEnabled) return;

    const advanceSlide = () => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        const node = scrollerRef.current;
        if (node) {
          isProgrammaticScrollRef.current = true;
          const scrollPosition = next * node.clientWidth;
          node.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
        return next;
      });
    };

    autoAdvanceTimerRef.current = setInterval(advanceSlide, 4000); // 4 seconds per slide

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [autoAdvanceEnabled]);

  // Track scroll to update active index
  React.useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const onScroll = () => {
      const x = node.scrollLeft;
      const w = node.clientWidth;
      const idx = Math.round(x / w);
      if (idx !== activeIndex) {
        setActiveIndex(idx);
        // Only stop auto-advance if this was a user-initiated scroll
        if (!isProgrammaticScrollRef.current) {
          setAutoAdvanceEnabled(false);
        }
        // Reset flag after a short delay to allow smooth scroll to complete
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 100);
      }
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [activeIndex]);

  // Track user interactions to stop auto-advance
  React.useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const handleInteraction = () => {
      setAutoAdvanceEnabled(false);
    };

    // Track various user interactions
    node.addEventListener("touchstart", handleInteraction, { passive: true });
    node.addEventListener("mousedown", handleInteraction);
    node.addEventListener("click", handleInteraction);

    return () => {
      node.removeEventListener("touchstart", handleInteraction);
      node.removeEventListener("mousedown", handleInteraction);
      node.removeEventListener("click", handleInteraction);
    };
  }, []);

  return (
    <div className="h-dvh px-0 pt-[max(env(safe-area-inset-top),0px)] pb-[max(env(safe-area-inset-bottom),0px)] text-left flex flex-col overflow-hidden">
      {/* Progress indicators */}
      <div className="mx-auto w-full max-w-[560px] px-4 pt-4 shrink-0">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={_.key}
              type="button"
              onClick={() => scrollToSlide(i)}
              className={`
                h-1 rounded-full transition-colors duration-200 cursor-pointer
                ${i === activeIndex ? "bg-[#2200FF]" : "bg-gray-200"}
                flex-1
              `}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slides */}
      <div
        ref={scrollerRef}
        className="flex-1 flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none min-h-0"
      >
        {SLIDES.map((slide) => (
          <section
            key={slide.key}
            className="snap-start shrink-0 w-full flex flex-col"
            aria-roledescription="slide"
            style={{ minWidth: '100%' }}
          >
            <div className="h-full mx-auto w-full max-w-[560px] px-6 flex flex-col items-center justify-center text-center py-8">
              <div className="flex flex-col items-center gap-6">
                <div className="shrink-0">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.imageAlt}
                    width={280}
                    height={220}
                    priority={slide.key === SLIDES[0].key}
                    className="w-full h-auto"
                  />
                </div>

                <h2
                  className="font-(family-name:--font-clash) text-[28px] font-semibold leading-[1.15] tracking-tight"
                  aria-live="polite"
                >
                  {slide.titleLines.map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Fixed CTA buttons */}
      <div className="mx-auto w-full max-w-[560px] px-6 pb-8 shrink-0">
        <div className="w-full space-y-3">


          <button
            // onClick={goToSignup}
            onClick={handleLogin}
            className="block w-full rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white text-center"
          >
            Create an account
          </button>
          <button
            onClick={goToSignin}
            className="block w-full rounded-[20px] bg-gray-100 px-4 py-3 text-[14px] font-medium text-gray-900 text-center"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}


