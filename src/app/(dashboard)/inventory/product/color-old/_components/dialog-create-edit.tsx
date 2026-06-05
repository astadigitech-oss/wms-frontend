"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { X } from "lucide-react";

const DialogCreateEdit = ({
  open,
  onOpenChange,
  rackId,
  input,
  setInput,
  handleCreate,
  handleUpdate,
  isPendingCreate,
  isPendingUpdate,
}: {
  open: boolean;
  onOpenChange: () => void;
  rackId: any;
  input: any;
  setInput: any;
  handleCreate: any;
  handleUpdate: any;
  isPendingCreate: boolean;
  isPendingUpdate: boolean;
}) => {
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (open && rackId) {
      setHintOpen(true);
    } else {
      setHintOpen(false);
    }
  }, [open, rackId]);

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{rackId ? "Edit Rack" : "Create Rack"}</DialogTitle>
          </DialogHeader>

          <div className="flex w-full gap-4">
            <form
              onSubmit={!rackId ? handleCreate : handleUpdate}
              className="w-full flex flex-col gap-4"
            >
              {/* INPUT NAME */}
              <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Name</Label>
                  <input
                    type="text"
                    value={input?.name ?? ""}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter rack name..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex w-full gap-2">
                <Button
                  className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                  onClick={() => onOpenChange()}
                  type="button"
                >
                  Cancel
                </Button>

                <Button
                  className={cn(
                    "text-black w-full",
                    rackId
                      ? "bg-yellow-400 hover:bg-yellow-400/80"
                      : "bg-sky-400 hover:bg-sky-400/80",
                  )}
                  type="submit"
                  disabled={
                    isPendingCreate || isPendingUpdate || !input?.name?.trim()
                  }
                >
                  {rackId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* HINT DIALOG */}
      <Dialog modal open={hintOpen} onOpenChange={setHintOpen}>
        <DialogContent onClose={false}>
          <DialogHeader className="border-b border-black pb-5">
            <DialogTitle className="flex justify-between items-center">
              🌟 Hints & Tips
              <TooltipProviderPage value="close" side="left">
                <button
                  onClick={() => setHintOpen(false)}
                  className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </TooltipProviderPage>
            </DialogTitle>
          </DialogHeader>

          {/* CONTENT */}
          <div className="flex flex-col gap-2 text-sm">
            <p>
              Jika Anda mengedit nama rak di <strong>staging</strong>, perubahan
              tersebut <strong>akan</strong> mempengaruhi perpindahan rak{" "}
              <strong>ke display</strong> sesuai dengan nama rak yang{" "}
              <strong>terkait.</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogCreateEdit;
