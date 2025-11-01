import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import Image from "next/image";
import { ArrowLeftIcon } from "@customIcons";

export default function ComingSoonPage() {
  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title="Coming soon"
        fixed
        left={
          <Link href="/home" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
      />

      <div className="mx-auto mt-16 flex w-full max-w-[560px] flex-col items-center text-center">
        <Image src="/logos/HODL_Primary_BlockBlue.svg" alt="HODL" width={120} height={40} priority />
        <h1 className="mt-6 text-[28px] font-semibold tracking-tight">We’re cooking this up</h1>
        <p className="mt-2 max-w-[420px] text-[14px] text-gray-600">
          This feature is under active development. Check back soon or return to the home screen.
        </p>
        <div className="mt-8 flex w-full max-w-[420px] items-center gap-2">
          <Link href="/home" className="w-full rounded-[20px] bg-gray-200 px-4 py-3 text-[14px] font-medium text-gray-900 text-center">
            Go home
          </Link>
          <Link href="/wallet" className="w-full rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white text-center">
            Open Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}


