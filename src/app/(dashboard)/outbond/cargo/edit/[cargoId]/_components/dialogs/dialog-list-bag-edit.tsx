import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {  columnEditListBag } from "../columns";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { X } from "lucide-react";

export const DialogListBagEdit = ({
  open,
  onOpenChange,
  listIdBag,
  selectedBagId,
  onSelectBag,
}: {
  open: boolean;
  onOpenChange: () => void;
  listIdBag: any;
  selectedBagId: any;
  onSelectBag: (id: string) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Select Bag
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col w-full gap-4">
          <DataTable
            isSticky
            maxHeight="h-[60vh]"
            columns={columnEditListBag({
              onClose: onOpenChange,
              onSelectBag,
              selectedBagId,
            })}
            data={listIdBag ?? []}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
