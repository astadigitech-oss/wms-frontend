"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { FileDown, Loader, RefreshCw, X } from "lucide-react";
import React from "react";

const DialogDetail = ({
  open,
  onCloseModal,
  data,
  isLoading,
  refetch,
  isRefetching,
  columns,
  dataTable,
  handleExport,
  isPendingExport,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  isLoading: boolean;
  refetch: any;
  isRefetching: any;
  columns: any;
  dataTable: any;
  handleExport: any;
  isPendingExport: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent
        onClose={false}
        className="min-w-[75vw]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail Cargo
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onCloseModal()}
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
          <div className="w-full flex flex-col gap-5 mt-5">
            <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-5 flex-col">
              <div className="flex w-full border-sky-400/80 rounded-md overflow-hidden border p-4 flex-col">
                <div className="w-full flex items-center">
                  <div className="flex items-center w-full">
                    <div className="flex w-full items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Name Buyer</p>
                        <p className="font-semibold capitalize text-lg">
                          {data?.name_buyer}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Document Code</p>
                        <p className="font-semibold capitalize text-lg">
                          {data?.code_document_bulky}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Discount</p>
                        <p className="font-semibold capitalize text-lg">
                          {data?.discount_bulky?.toLocaleString()}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-500 h-20"
                  />
                  <div className="flex items-center gap-4 ml-4">
                    <TooltipProviderPage value={"Reload Data"}>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          refetch();
                        }}
                        className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                        variant={"outline"}
                      >
                        <RefreshCw
                          className={cn(
                            "w-4 h-4",
                            isRefetching ? "animate-spin" : ""
                          )}
                        />
                      </Button>
                    </TooltipProviderPage>
                  </div>
                </div>
                <Separator className="bg-gray-500" />
                <div className="w-full flex items-center">
                  <div className="flex items-center w-full">
                    <div className="flex w-full items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Total Product</p>
                        <p className="font-semibold capitalize text-lg">
                          {data?.total_product_bulky.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Total Old Price</p>
                        <p className="font-semibold capitalize text-lg">
                          {formatRupiah(data?.total_old_price_bulky)}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Total New Price</p>
                        <p className="font-semibold capitalize text-lg">
                          {formatRupiah(data?.after_price_bulky)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center gap-4">
              <Button
                variant={"liquid"}
                type="button"
                onClick={() => handleExport("data")}
                disabled={isPendingExport}
                // className="bg-white text-black hover:bg-sky-50"
              >
                <FileDown className="size-4 ml-1" />
                Export Data
              </Button>
            </div>
            <DataTable
              maxHeight="h-[45vh]"
              isSticky
              isLoading={isRefetching}
              columns={columns}
              data={dataTable}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetail;
