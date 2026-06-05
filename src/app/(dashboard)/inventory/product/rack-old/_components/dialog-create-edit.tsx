"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

const DialogCreateEdit = ({
  open,
  onCloseModal,
  rackId,
  input,
  setInput,
  handleClose,
  handleCreate,
  handleUpdate,
  isPendingCreate,
  isPendingUpdate,
  data,
}: {
  open: boolean;
  onCloseModal: () => void;
  rackId: any;
  input: any;
  setInput: any;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
  isPendingCreate: boolean;
  isPendingUpdate: boolean;
  data: any;
}) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  useEffect(() => {
    if (open && rackId) {
      setHintOpen(true);
    } else {
      setHintOpen(false);
    }
  }, [open, rackId]);
  useEffect(() => {
    if (!input?.name || !data?.data) return;

    const racks = data.data; // array data racks dari API

    const newName = input.name.trim().toLowerCase();

    const exists = racks.some(
      (item: any) =>
        item?.name?.trim().toLowerCase() === newName && item?.id !== rackId // untuk edit: tidak bandingkan dengan dirinya sendiri
    );

    setIsDuplicate(exists);
  }, [input.name, data, rackId]);

  return (
    <>
      {/* === MAIN DIALOG === */}
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{rackId ? "Edit Rack" : "Create Rack"}</DialogTitle>
          </DialogHeader>

          <div className="flex w-full gap-4">
            <form
              onSubmit={!rackId ? handleCreate : handleUpdate}
              className="w-full flex flex-col gap-4"
            >
              <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Name</Label>

                  <Input
                    className={cn(
                      "border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500",
                      isDuplicate && "border-red-500 text-red-600"
                    )}
                    placeholder="Rack name..."
                    value={input.name}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />

                  {isDuplicate && (
                    <p className="text-xs text-red-600">
                      Nama rack sudah digunakan. Silakan gunakan nama lain.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex w-full gap-2">
                <Button
                  className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  className={cn(
                    "text-black w-full",
                    rackId
                      ? "bg-yellow-400 hover:bg-yellow-400/80"
                      : "bg-sky-400 hover:bg-sky-400/80"
                  )}
                  type="submit"
                  disabled={isPendingCreate || isPendingUpdate || isDuplicate}
                >
                  {rackId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* === HINTS DIALOG === */}
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
              Jika Anda mengedit nama rak <strong>display</strong>, perubahan
              tersebut <strong>tidak</strong> {" "}
              akan mempengaruhi nama rak yang terkait di{" "}
              <strong>staging.</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogCreateEdit;
