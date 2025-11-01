"use client";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import { ArrowLeftIcon } from "@customIcons";
import React from "react";
import Modal from "@/components/ui/Modal";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function TransactionDetailPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id ?? "");
  const type = (search.get("type") ?? "repay") as "repay" | "borrow";

  // For now, use mock values; integrate real data source later
  const amount = "₦100,000.00";
  const status = (search.get("status") ?? "success") as "success" | "pending" | "failed";
  const date = "18 Sep at 12:20PM";

  const [reportOpen, setReportOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement | null>(null);
  
  async function shareAsImage() {
    try {
    //   console.log("[shareAsImage] start");
      if (!receiptRef.current) {
        console.warn("[shareAsImage] receiptRef is null");
        return;
      }
      const { toBlob } = await import("html-to-image");
    //   console.log("[shareAsImage] imported html-to-image");
      const node = receiptRef.current;
      const width = node.scrollWidth;
      const pad = 48; // extra bottom space for capture
      const height = node.scrollHeight + pad;
    //   console.log("[shareAsImage] node dims", { width, height });
      const blob = await toBlob(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px`, transform: "none" },
      });
      if (!blob) {
        console.warn("[shareAsImage] toBlob returned null");
        return;
      }
      const file = new File([blob], `receipt-${id}.png`, { type: "image/png" });
    //   console.log("[shareAsImage] file prepared", file);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (navigator.canShare?.({ files: [file] })) {
        // console.log("[shareAsImage] using navigator.share with file");
        await navigator.share({ files: [file], title: "Receipt", text: `Transaction ${id}` });
        if (!isMobile) {
        //   console.log("[shareAsImage] desktop env detected – also downloading as fallback");
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = file.name; a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // console.log("[shareAsImage] navigator.share not available, downloading");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
    //   console.log("[shareAsImage] done");
    } catch (err) {
      console.error("[shareAsImage] error", err);
    } finally {
      setShareOpen(false);
    }
  }

  async function shareAsPdf() {
    try {
    //   console.log("[shareAsPdf] start");
      if (!receiptRef.current) {
        console.warn("[shareAsPdf] receiptRef is null");
        return;
      }
      const { toCanvas } = await import("html-to-image");
    //   console.log("[shareAsPdf] imported html-to-image");
      const node = receiptRef.current;
      const width = node.scrollWidth;
      const pad = 48; // extra bottom space for capture
      const height = node.scrollHeight + pad;
      const canvas = await toCanvas(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px`, transform: "none" },
      });
    //   console.log("[shareAsPdf] canvas prepared", canvas.width, canvas.height);
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "px", orientation: canvas.width >= canvas.height ? "l" : "p", format: [canvas.width, canvas.height] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      const blob = pdf.output("blob");
      const file = new File([blob], `receipt-${id}.pdf`, { type: "application/pdf" });
    //   console.log("[shareAsPdf] pdf file prepared", file);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (navigator.canShare?.({ files: [file] })) {
        // console.log("[shareAsPdf] using navigator.share with file");
        await navigator.share({ files: [file], title: "Receipt", text: `Transaction ${id}` });
        if (!isMobile) {
        //   console.log("[shareAsPdf] desktop env detected – also downloading as fallback");
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = file.name; a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // console.log("[shareAsPdf] navigator.share not available, downloading");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
    //   console.log("[shareAsPdf] done");
    } catch (err) {
      console.error("[shareAsPdf] error", err);
    } finally {
      setShareOpen(false);
    }
  }
  const [message, setMessage] = React.useState("");

  return (
    <div className="min-h-dvh px-2 pt-14 pb-4 text-left">
      <AppHeader
        title="Transaction details"
        fixed
        left={
          <Link href="/home/transactions" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <ArrowLeftIcon size={18} color="#374151" />
          </Link>
        }
      />

      <div ref={receiptRef} className="mx-auto mt-6 w-full max-w-[560px] rounded-2xl bg-white p-4 text-left shadow relative overflow-hidden">
        <div className="text-center">
          <div className="text-[28px] font-semibold tracking-tight">{amount}</div>
          <div
            className={
              `mt-2 inline-flex rounded-full px-3 py-1 text-[12px] ` +
              (status === "success"
                ? "bg-emerald-100 text-emerald-700"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700")
            }
          >
            {status === "success" ? "Success" : status === "pending" ? "Pending" : "Failed"}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {type === "borrow" ? (
            <CollateralRow
              assets={[
                { symbol: "USDT", amount: "20", logo: "/assets/usdt.svg" },
                { symbol: "USDC", amount: "30", logo: "/assets/usdc.svg" },
                { symbol: "ETH", amount: "0.003", logo: "/assets/eth.svg" },
              ]}
            />
          ) : null}
          <Row left={type === "borrow" ? "Receiver details" : "Sender details"} right={"Samson Ajewole\nPeak Bank  |  0011223344"} />
          <Row left="Remark" right={type === "borrow" ? "Loan borrowed" : "Debt cancellation"} />
          <Row left="Transaction No." right="0146278363678374682947444" />
          <Row left="Transaction date" right="18 Sep at 12:20PM" />
          <Row left="Transaction type" right={type === "borrow" ? "Money borrowed" : "Money deposit"} />
        </div>

        {/* Watermark overlay (hidden for successful borrows) */}
        {!(type === "borrow" && status === "success") && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Image
              src="/logos/HODL_Neutral_Black.svg"
              alt=""
              width={360}
              height={120}
              className="opacity-10 select-none"
              priority
            />
          </div>
        )}
      </div>

      <div className="h-24" />

      <div className="fixed inset-x-0 z-10 bottom-[calc(max(env(safe-area-inset-bottom),8px)+64px)]">
        <div className="mx-auto w-full max-w-[560px] bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {type === "borrow" && status !== "failed" ? (
            <div className="flex items-center gap-2">
              <Link href={`/repayments/${id}`} className="w-full rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white text-center">Repay loan</Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button className="w-1/2 rounded-[20px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer" onClick={() => setReportOpen(true)}>Report issue</button>
              <button className="w-1/2 rounded-[20px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer" onClick={() => setShareOpen(true)}>Share receipt</button>
            </div>
          )}
        </div>
      </div>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)}>
        <div className="space-y-4">
          <div className="text-[18px] font-semibold">Report issue</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-gray-600">
            <div>Transaction ID</div>
            <div className="text-right text-gray-900">{id}</div>
            <div>Amount</div>
            <div className="text-right text-gray-900">{amount}</div>
            <div>Date</div>
            <div className="text-right text-gray-900">{date}</div>
          </div>
          <div>
            <label className="block text-[12px] text-gray-600">Describe the issue</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what went wrong..."
              className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-[14px] outline-none focus:border-gray-400"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="w-1/2 rounded-lg bg-gray-200 px-4 py-2 text-[14px]" onClick={() => setReportOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="w-1/2 rounded-lg bg-[#2200FF] px-4 py-2 text-[14px] text-white"
              onClick={() => {
                // console.log("Report submitted", { id, amount, date, message });
                setReportOpen(false);
                setMessage("");
              }}
            >
              Submit report
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)}>
        <div className="space-y-3">
          <div className="text-[18px] font-semibold">Share receipt</div>
          <div className="flex flex-col items-stretch gap-2">
            <button className="w-full rounded-lg bg-gray-200 px-4 py-2 text-[14px] cursor-pointer" onClick={shareAsImage}>Share as image</button>
            <button className="w-full rounded-lg bg-[#2200FF] px-4 py-2 text-[14px] text-white cursor-pointer" onClick={shareAsPdf}>Share as PDF</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[14px] font-medium text-gray-500">{left}</div>
      <div className="text-right text-[14px] whitespace-pre-line">{right}</div>
    </div>
  );
}

function CollateralRow({ assets }: { assets: { symbol: string; amount: string; logo: string }[] }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[14px] font-medium text-gray-500">Collateralized assets</div>
      <div className="flex flex-wrap justify-end gap-2">
        {assets.map((a) => (
          <span key={`${a.symbol}-${a.amount}`} className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-[12px] text-gray-800">
            <Image src={a.logo} alt={a.symbol} width={16} height={16} className="rounded-full" />
            <span>
              {a.amount}
              {a.symbol}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}


