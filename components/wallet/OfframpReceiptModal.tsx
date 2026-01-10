"use client";
import React from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

function formatAddress(value?: string | null) {
  if (!value) return "—";
  const v = value.trim();
  if (/^0x[0-9a-fA-F]{10,}$/.test(v)) {
    return `${v.slice(0, 6)}...${v.slice(-4)}`;
  }
  return v || "—";
}

export interface OfframpReceiptData {
  id: string;
  transactionNo: string;
  transactionHash: string;
  amount: string;
  remark: string;
  status: string;
  createdAt: string;
  receiver: {
    name: string;
    accountNumber: string;
    bankName: string;
    currency: string;
  };
  walletType: string;
}

type OfframpReceiptModalProps = {
  open: boolean;
  onClose: () => void;
  receipt: OfframpReceiptData | null;
};

export default function OfframpReceiptModal({ open, onClose, receipt }: OfframpReceiptModalProps) {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement | null>(null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  async function shareAsImage() {
    if (!receiptRef.current || !receipt) return;
    try {
      setIsSharing(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const { toBlob } = await import("html-to-image");
      const node = receiptRef.current;
      const width = node.scrollWidth;
      const pad = 48;
      const height = node.scrollHeight + pad;
      const blob = await toBlob(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px`, transform: "none" },
        fontEmbedCSS: "",
        useCORS: true,
        cacheBust: true,
        filter: (node: Node) => {
          if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE") {
            return false;
          }
          return true;
        },
      });
      if (!blob) return;
      const file = new File([blob], `offramp-receipt-${receipt.transactionNo}.png`, { type: "image/png" });
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Offramp Receipt", text: `Offramp transaction ${receipt.transactionNo}` });
        if (!isMobile) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[shareAsImage] error", err);
    } finally {
      setIsSharing(false);
      setShareOpen(false);
    }
  }

  async function shareAsPdf() {
    if (!receiptRef.current || !receipt) return;
    try {
      setIsSharing(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const { toCanvas } = await import("html-to-image");
      const node = receiptRef.current;
      const width = node.scrollWidth;
      const pad = 48;
      const height = node.scrollHeight + pad;
      const canvas = await toCanvas(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px`, transform: "none" },
        fontEmbedCSS: "",
        useCORS: true,
        cacheBust: true,
        filter: (node: Node) => {
          if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE") {
            return false;
          }
          return true;
        },
      });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        unit: "px",
        orientation: canvas.width >= canvas.height ? "l" : "p",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      const blob = pdf.output("blob");
      const file = new File([blob], `offramp-receipt-${receipt.transactionNo}.pdf`, { type: "application/pdf" });
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Offramp Receipt", text: `Offramp transaction ${receipt.transactionNo}` });
        if (!isMobile) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[shareAsPdf] error", err);
    } finally {
      setIsSharing(false);
      setShareOpen(false);
    }
  }

  if (!receipt) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-[24px] font-semibold leading-6">Receipt</div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div ref={receiptRef} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 text-center">
            <div className="text-[20px] font-semibold text-gray-900">Offramp Receipt</div>
            <div className="mt-1 text-[12px] text-gray-600">Transaction #{receipt.transactionNo}</div>
          </div>

          <div className="space-y-3 divide-y divide-gray-100">
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Status</div>
              <div className="text-right font-medium capitalize">{receipt.status.toLowerCase()}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Amount</div>
              <div className="text-right font-medium">{receipt.amount} {receipt.receiver.currency}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Description</div>
              <div className="text-right font-medium">{receipt.remark}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Recipient Name</div>
              <div className="text-right font-medium">{receipt.receiver.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Account Number</div>
              <div className="text-right font-medium">{receipt.receiver.accountNumber}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Bank</div>
              <div className="text-right font-medium">{receipt.receiver.bankName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Transaction Hash</div>
              <div className="text-right font-medium">
                <span className="break-all font-mono text-[12px]">{isSharing ? receipt.transactionHash : formatAddress(receipt.transactionHash)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Network</div>
              <div className="text-right font-medium capitalize">{receipt.walletType}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="text-gray-600">Date</div>
              <div className="text-right font-medium">{formatDate(receipt.createdAt)}</div>
            </div>
          </div>
        </div>

        {shareOpen ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={shareAsImage}
              disabled={isSharing}
              className="w-1/2 rounded-[14px] border border-gray-300 bg-white px-4 py-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              {isSharing ? "Sharing..." : "Image"}
            </button>
            <button
              type="button"
              onClick={shareAsPdf}
              disabled={isSharing}
              className="w-1/2 rounded-[14px] border border-gray-300 bg-white px-4 py-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              {isSharing ? "Sharing..." : "PDF"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-1/2 rounded-[14px] bg-gray-200 px-4 py-3 text-[14px] font-medium cursor-pointer"
              onClick={onClose}
            >
              Done
            </button>
            <button
              type="button"
              className="w-1/2 rounded-[14px] bg-[#2200FF] px-4 py-3 text-[14px] font-medium text-white cursor-pointer"
              onClick={() => setShareOpen(true)}
            >
              Share
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
