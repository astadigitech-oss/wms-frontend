"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
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
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Barcode Bundle (${items.length})`,
    pageStyle: `
  @page {
    size: 7cm 4cm landscape;
    margin: 0;
  }

  @media print {

    html,
    body{
      margin:0;
      padding:0;
    }

    .barcode-print-container{
      display:block !important;
    }

    .barcode-item{
      display:block !important;
      width:7cm !important;
      height:4cm !important;

      page-break-after: always;
      page-break-inside: avoid;
      break-after: page;
      break-inside: avoid;

      margin:0 !important;
      padding:0 !important;
    }

    .barcode-item:last-child{
      page-break-after:auto;
      break-after:auto;
    }

    .barcode-wrapper{
      border:none !important;
      box-shadow:none !important;
      padding:0 !important;
      margin:0 !important;
      width:7cm !important;
      height:4cm !important;
    }

    .no-print{
      display:none !important;
    }
  }
`,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Preview Barcode */}
      <div
        ref={printRef}
        className="barcode-print-container grid grid-cols-2 gap-4"
      >
        {items.map((item, index) => (
          <div key={`${item.barcode}-${index}`} className="barcode-item">
            <BarcodePrinted
              {...item}
              showCancel={true} // tombol Print tetap tampil
            />
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-end gap-3 pt-4 border-t no-print">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={() => handlePrint()}
          className="px-6 py-2 rounded bg-sky-400 hover:bg-sky-500 text-black"
        >
          Print All ({items.length})
        </button>
      </div>
    </div>
  );
};

export default BarcodePrintPreview;
