"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Loader2, X } from "lucide-react";
import React from "react";

const DialogCreateVoucher = ({
  open,
  onCloseModal,
  input,
  setInput,
  handleSubmit,
  isPending,
}: {
  open: boolean;
  onCloseModal: () => void;
  input: any;
  setInput: any;
  handleSubmit: any;
  isPending: boolean;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent onClose={false} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Create Voucher
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onCloseModal()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex w-full flex-col gap-4"
        >
          <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
            <div className="flex flex-col gap-1 w-full">
              <Label>Voucher Name</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
                placeholder="Voucher name..."
                value={input.name}
                onChange={(e) =>
                  setInput((prev: any) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 w-full">
                <Label>Amount</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
                  placeholder="0"
                  type="number"
                  min={0}
                  value={input.amount}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Max Value</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
                  placeholder="0"
                  type="number"
                  min={0}
                  value={input.max_usage}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      max_usage: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Max Week</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
                  placeholder="0"
                  type="number"
                  min={0}
                  value={input.max_week}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      max_week: e.target.value,
                    }))
                  }
                />
              </div>
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
              className="text-black w-full bg-sky-400 hover:bg-sky-400/80"
              type="submit"
              disabled={!input.name || isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateVoucher;
