"use client";

import React, { useRef } from "react";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { formatRupiah } from "@/lib/utils";

interface BarcodePrint {
  oldPrice: string;
  newPrice: string;
  barcode: string;
  category: string;
  discount?: string;
  isBundle?: boolean;
  colorHex?: string;
  description?: string;
  cancel?: () => void;
  showAction?: boolean;
}

const BarcodePrinted: React.FC<BarcodePrint> = ({
  oldPrice,
  newPrice,
  barcode,
  category,
  discount,
  isBundle,
  colorHex,
  description,
  cancel,
  showAction = true,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Barcode - ${barcode}`,
    pageStyle: `
      @page {
        size: auto;
        margin: 8mm;
      }

      @media print {

        .barcode-wrapper{
          border:none !important;
          box-shadow:none !important;
          padding:0 !important;
          margin:0 !important;
          background:transparent !important;
        }

        .no-print{
          display:none !important;
        }
      }
    `,
  });

  return (
    <div>
      <div className="barcode-wrapper border rounded-md border-gray-500 p-2 w-fit">
        <div
          ref={componentRef}
          className="w-[7cm] h-[4cm] flex justify-start items-center font-sans p-1"
        >
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              {barcode && (
                <Barcode
                  value={barcode}
                  width={1.2}
                  height={50}
                  font="sans-serif"
                  fontOptions="bold"
                  fontSize={16}
                  textMargin={3}
                />
              )}

              {category && (
                <div className="border border-black py-1 px-2 text-center w-[80px]">
                  <p className="font-bold text-[10px] leading-3 break-all">
                    {colorHex && (
                      <span
                        className="inline-block mr-1"
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: colorHex,
                          borderRadius: "50%",
                          border: "1px solid #000",
                        }}
                      />
                    )}

                    {category}

                    {discount && (
                      <span className="whitespace-nowrap">
                        {" "}
                        ({discount}%)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {description && (
              <div className="text-[11px] font-semibold mt-1 line-clamp-2 leading-tight">
                {description}
              </div>
            )}

            {newPrice && (
              <div className="flex text-base font-semibold gap-1 mt-1">
                <div className="flex flex-col">
                  <p>{!isBundle ? "Harga Retail" : "Total Awal"}</p>
                  <p>{!isBundle ? "Harga Diskon" : "Custom Display"}</p>
                </div>

                <div className="flex flex-col">
                  <p>
                    :{" "}
                    <span className="line-through">
                      {formatRupiah(parseFloat(oldPrice))}
                    </span>
                  </p>

                  <p>: {formatRupiah(parseFloat(newPrice))}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAction && (
        <div className="flex items-center gap-2 mt-6 no-print">
          {cancel && (
            <button
              onClick={(e) => {
                e.preventDefault();
                cancel();
              }}
              className="py-2 px-8 bg-gray-300/80 text-black rounded-full hover:bg-gray-300"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => handlePrint()}
            className="py-2 px-8 bg-sky-400/80 text-black rounded-full hover:bg-sky-400"
          >
            Print
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodePrinted;