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
import { cn, numericString } from "@/lib/utils";
import { AlertCircle, Check, Percent } from "lucide-react";
import React from "react";

const DialogDiscount = ({
  open,
  onCloseModal,
  input,
  setInput,
}: {
  open: boolean;
  onCloseModal: () => void;
  input: any;
  setInput: any;
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Apply discount to product price
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex gap-2 items-center bg-yellow-300 rounded border border-yellow-500 text-sm p-3">
              <AlertCircle className="size-4 flex-none" />
              <p>
                The discount is applied before any products are on sale. If you
                want to change the discount, please clear the sale products
                first.
              </p>
            </div>
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Discount</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                value={input.discount}
                onChange={(e) =>
                  setInput((prev: any) => ({
                    ...prev,
                    discount: numericString(e.target.value),
                  }))
                }
              />
              <Percent className="w-4 h-4 absolute right-3 bottom-2" />
            </div>
            <div
              className={cn(
                "flex flex-col gap-1 w-full",
                !input.discountFor && "opacity-50"
              )}
            >
              <Label>Discount for</Label>
              <div className="flex gap-2 w-full border p-2 border-sky-400/80 rounded-lg">
                <Button
                  disabled={!input.discountFor}
                  className={cn(
                    "w-full pr-6",
                    input.discountFor !== "old" && "bg-sky-200 hover:bg-sky-300"
                  )}
                  variant={"liquid"}
                  onClick={() =>
                    setInput((prev: any) => ({ ...prev, discountFor: "old" }))
                  }
                >
                  <Check
                    className={cn(
                      "opacity-0",
                      input.discountFor === "old" && "opacity-100"
                    )}
                  />
                  Old Price
                </Button>
                <Button
                  disabled={!input.discountFor}
                  className={cn(
                    "w-full pr-6",
                    input.discountFor !== "new" && "bg-sky-200 hover:bg-sky-300"
                  )}
                  variant={"liquid"}
                  onClick={() =>
                    setInput((prev: any) => ({ ...prev, discountFor: "new" }))
                  }
                >
                  <Check
                    className={cn(
                      "opacity-0",
                      input.discountFor === "new" && "opacity-100"
                    )}
                  />
                  New Price
                </Button>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                onClick={onCloseModal}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogDiscount;
