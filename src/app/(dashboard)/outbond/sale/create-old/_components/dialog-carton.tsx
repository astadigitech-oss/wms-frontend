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

const DialogCarton = ({
  open,
  onCloseModal,
  carton,
  setCarton,
  isDirty,
  setIsDirty,
}: {
  open: boolean;
  onCloseModal: () => void;
  carton: any;
  setCarton: any;
  isDirty: any;
  setIsDirty: any;
}) => {
  const [input, setInput] = useState({
    qty: "0",
    unit: "0",
  });

  useEffect(() => {
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(input.unit))) {
      setInput((prev) => ({ ...prev, unit: "0" }));
    }
  }, [input]);

  useEffect(() => {
    if (!open) {
      setInput({
        qty: "0",
        unit: "0",
      });
    }
    if (open && carton) {
      setInput({
        qty: carton.cartonQty,
        unit: carton.cartonUnit,
      });
    }
  }, [open]);
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Carton Box</DialogTitle>
            <DialogDescription>Re-configurate Carton Box</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCarton((prev: any) => ({
                ...prev,
                cartonQty: input.qty,
                cartonUnit: input.unit,
              }));
              onCloseModal();
              if (!isDirty) {
                setIsDirty(true);
              }
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 w-full">
              <Label>Qty</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                type="number"
                value={input.qty}
                onChange={(e) =>
                  setInput((prev: any) => ({
                    ...prev,
                    qty: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label>Per Unit</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                type="number"
                value={input.unit}
                onChange={(e) =>
                  setInput((prev: any) => ({
                    ...prev,
                    unit: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label>Price Carton Box</Label>
              <div className="text-sm font-bold border border-sky-500 rounded-md flex px-5 items-center justify-center h-9">
                {formatRupiah(parseFloat(input.unit) * parseFloat(input.qty))}
              </div>
            </div>
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
              >
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogCarton;
