"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Loader, ScanBarcode, X } from "lucide-react";
import React from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void; // ✅ ganti ini
  data: any;
  isLoading: boolean;
};

const DialogDetail = ({
  open,
  onOpenChange,
  data,
  isLoading,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={false}
        className="max-w-3xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail Product Color

            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange(false)} // ✅ close pakai ini
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="w-full h-[78vh] flex justify-center items-center">
            <Loader className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="w-full mt-5 text-sm">
            <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
              <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                <ScanBarcode className="w-4 h-4 mr-2" />
                <div className="flex w-full items-center justify-between">
                  <p>Product Data</p>
                  <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                    {data?.old_barcode_product}
                  </Badge>
                </div>
              </div>

              <div className="w-full grid grid-cols-3">
                <div className="flex gap-3 flex-col pl-6 col-span-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">Name Product</p>
                    <p className="text-sm text-gray-500 truncate">
                      {data?.new_name_product}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">Old Price</p>
                    <p className="text-sm text-gray-500">
                      {formatRupiah(
                        parseFloat(data?.old_price_product ?? "0")
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">Qty</p>
                    <p className="text-sm text-gray-500">
                      {parseFloat(
                        data?.new_quantity_product ?? "0"
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col col-span-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">Color</p>
                    <p className="text-sm text-gray-500">
                      {data?.new_tag_product}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">New Price</p>
                    <p className="text-sm text-gray-500">
                      {formatRupiah(
                        parseFloat(data?.new_price_product ?? "0")
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetail;