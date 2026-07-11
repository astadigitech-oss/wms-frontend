"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const DialogVoucher = ({
  open,
  onCloseModal,
  data,
  voucher,
  onApplyVoucher,
  onDeleteVoucher,
  isDeleting,
  isApplying,
  isDirty,
  setIsDirty,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  voucher: any;
  onApplyVoucher: (amount: number) => void;
  onDeleteVoucher: () => void;
  isDeleting: boolean;
  isApplying: boolean;
  isDirty: any;
  setIsDirty: any;
}) => {
  const [input, setInput] = useState("0");

  useEffect(() => {
    if (isNaN(parseFloat(input))) {
      setInput("0");
    }
  }, [input]);

  useEffect(() => {
    if (!open) {
      setInput("0");
    }
    if (open && voucher) {
      setInput(voucher);
    }
  }, [open, voucher]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Voucher</DialogTitle>
            <DialogDescription>Apply voucher to sale price</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const voucherAmount = parseFloat(input) || 0;
              onApplyVoucher(voucherAmount);
              onCloseModal();
              if (!isDirty) {
                setIsDirty(true);
              }
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Voucher</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  )
                }
              />
              <p className="absolute right-3 bottom-2 text-xs text-gray-500">
                {formatRupiah(parseFloat(input))}
              </p>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label>Price After Voucher</Label>
              <div className="text-sm font-bold border border-sky-500 rounded-md flex px-5 items-center justify-center h-9">
                {formatRupiah(parseFloat(data) - parseFloat(input))}
              </div>
            </div>
            {parseFloat(voucher || "0") > 0 && (
              <div className="flex flex-col gap-1 w-full">
                <Label>Applied Voucher</Label>
                <div className="text-sm font-semibold border border-slate-200 rounded-md flex px-5 items-center justify-center h-9">
                  {formatRupiah(parseFloat(voucher || "0"))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex w-full gap-2">
                <Button
                  className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                  onClick={onCloseModal}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                  type="submit"
                  disabled={isApplying}
                >
                  {isApplying ? "Applying..." : "Apply"}
                </Button>
              </div>
              {parseFloat(voucher || "0") > 0 && (
                <Button
                  className="w-full bg-red-100 text-red-700 hover:bg-red-100"
                  type="button"
                  onClick={() => {
                    onDeleteVoucher();
                    onCloseModal();
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Voucher"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogVoucher;
