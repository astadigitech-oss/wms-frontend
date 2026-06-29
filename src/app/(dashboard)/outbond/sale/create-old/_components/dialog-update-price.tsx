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

const DialogUpdatePrice = ({
  open,
  onCloseModal,
  data,
  handleSubmit,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  handleSubmit: any;
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
  }, [open]);
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Price Product Sale</DialogTitle>
            <DialogDescription>Set new product sale</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(input);
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 w-full">
              <Label>Old Price</Label>
              <div className="text-sm font-bold border border-sky-500 rounded-md flex px-5 items-center justify-center h-9">
                {formatRupiah(parseFloat(data))}
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full relative">
              <Label>New Price</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                value={input}
                // disabled={loadingSubmit}
                onChange={(e) =>
                  setInput(
                    e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value
                  )
                }
              />
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
                className="bg-yellow-400 hover:bg-yellow-400/80 text-black w-full"
                type="submit"
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogUpdatePrice;
