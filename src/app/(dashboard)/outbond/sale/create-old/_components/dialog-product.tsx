"use client";

import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { RefreshCw, X } from "lucide-react";
import React from "react";

const DialogProduct = ({
  open,
  onCloseModal,
  search,
  setSearch,
  refetch,
  isRefetching,
  columns,
  dataTable,
  page,
  metaPage,
  setPage,
}: {
  open: boolean;
  onCloseModal: () => void;
  search: any;
  setSearch: any;
  refetch: any;
  isRefetching: any;
  columns: any;
  dataTable: any;
  page: any;
  metaPage: any;
  setPage: any;
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent
          onClose={false}
          className="min-w-[75vw]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="justify-between flex items-center">
              Select Product
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
          <div className="flex flex-col w-full gap-4">
            <div className="flex gap-2 items-center w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
              />
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
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
            <DataTable
              isSticky
              maxHeight="h-[60vh]"
              isLoading={isRefetching}
              columns={columns}
              data={dataTable ?? []}
            />
            <Pagination
              pagination={{ ...metaPage, current: page }}
              setPagination={setPage}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogProduct;
