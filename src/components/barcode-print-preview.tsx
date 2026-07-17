"use client";

import React, { useRef } from "react";
import BarcodePrinted from "@/components/barcode";

interface BarcodeItem {
  barcode: string;
  description: string;
  oldPrice: string;
  newPrice: string;
  category: string;
  discount?: string;
  isBundle?: boolean;
  colorHex?: string;
}

interface Props {
  items: BarcodeItem[];
  onClose: () => void;
}

const BarcodePrintPreview: React.FC<Props> = ({ items, onClose }) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  // Print each child of printRef one-by-one using a hidden iframe.
  const printElement = (el: HTMLElement) => {
    return new Promise<void>((resolve) => {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        resolve();
        return;
      }

      // copy styles
      const styles = Array.from(
        document.querySelectorAll("link[rel=stylesheet], style"),
      )
        .map((n) => n.outerHTML)
        .join("\n");

      doc.open();
      doc.write(
        `<!doctype html><html><head>${styles}</head><body>${el.outerHTML}</body></html>`,
      );
      doc.close();

      const cleanup = () => {
        try {
          iframe.remove();
        } catch {}
        resolve();
      };

      // Wait a bit for images/SVG to render inside iframe, then print
      const win = iframe.contentWindow;
      const tryPrint = () => {
        if (!win) {
          cleanup();
          return;
        }
        const onAfter = () => {
          win.removeEventListener("afterprint", onAfter);
          cleanup();
        };
        win.addEventListener("afterprint", onAfter);
        try {
          win.focus();
          // call print
          win.print();
        } catch {
          // some browsers block automatic prints; still resolve
          setTimeout(cleanup, 500);
        }
      };

      // small delay to allow resources to load
      setTimeout(tryPrint, 300);
    });
  };

  const printAllSequential = async () => {
    const container = printRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await printElement(children[i]);
      // small gap between prints to ensure dialogs close
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 250));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* PREVIEW AREA */}
      <div ref={printRef} className="grid grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={item.barcode}
            className={(index + 1) % 8 === 0 ? "page-break" : ""}
          >
            <BarcodePrinted {...item} />
          </div>
        ))}
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // print each item sequentially in one click
            printAllSequential();
          }}
          className="px-6 py-2 rounded bg-sky-400 hover:bg-sky-500 text-black"
        >
          Print All ({items.length})
        </button>
      </div>
    </div>
  );
};

export default BarcodePrintPreview;
