import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { columnEditListBag } from "../columns";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { X, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DialogListBagEdit = ({
  open,
  onOpenChange,
  listIdBag,
  selectedBagId,
  onSelectBag,
  isLoadingBag,
  isRefetchingBag,
  onRefetch,
}: {
  open: boolean;
  onOpenChange: () => void;
  listIdBag: any;
  selectedBagId: any;
  onSelectBag: (id: string) => void;
  isLoadingBag: boolean;
  isRefetchingBag: boolean;
  onRefetch: () => void;
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
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">Select Bag</span>
              <TooltipProviderPage value="refetch" side="bottom">
                  <Button
                  onClick={onRefetch}
                  disabled={isRefetchingBag}
 variant={"outline"}
                    className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 flex-none"
                    size={"icon"}                >
                    <RefreshCcw className={isLoadingBag ? "animate-spin" : ""} />
                </Button>
              </TooltipProviderPage>
               {/* <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 flex-none"
                    size={"icon"}
                    onClick={() => refetch()}
                  >
                    <RefreshCcw className={isLoading ? "animate-spin" : ""} />
                  </Button>
                </TooltipProviderPage> */}
            </div>
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
            isLoading={isLoadingBag || isRefetchingBag}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
