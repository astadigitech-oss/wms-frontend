"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { numericString } from "@/lib/utils";

import { Percent } from "lucide-react";
import React, { FormEvent, useEffect, useState } from "react";

export const DialogDiscount = ({
  open,
  onOpenChange,
  data,
  setData,
}: {
  open: boolean;
  onOpenChange: () => void;
  data: any;
  setData: any;
}) => {
  const [input, setInput] = useState("0");

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    setData((prev: any) => ({ ...prev, discount_bulky: input }));
    onOpenChange();
  };

  useEffect(() => {
    if (isNaN(parseFloat(input))) {
      setInput("0");
    }
  }, [input]);

  useEffect(() => {
    if (open) {
      setInput(data.discount_bulky);
    } else {
      setInput("0");
    }
  }, [open]);
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>Apply discount to Cargo price</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Discount</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                value={input}
                type="number"
                onChange={(e) => setInput(numericString(e.target.value))}
              />
              <Percent className="w-4 h-4 absolute right-3 bottom-2" />
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant={"outline"}
                className="border-black w-full"
                onClick={onOpenChange}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                type="submit"
              >
                Apply
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
