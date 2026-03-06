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

import React, { FormEvent, useEffect, useState } from "react";

export const DialogName = ({
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
  const [input, setInput] = useState("");

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    setData((prev: any) => ({ ...prev, name_document: input }));
    onOpenChange();
  };

  useEffect(() => {
    if (open) {
      setInput(data.name_document);
    } else {
      setInput("");
    }
  }, [open]);
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Name Cargo</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <form onSubmit={handleApply} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Name</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="Type name"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
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
