import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Barcode } from "lucide-react";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

export const DialogDamaged = ({
  isOpen,
  handleClose,
  barcode,
  description,
  setDescription,
  isLoading,
  handleSubmit,
}: {
  isOpen: boolean;
  handleClose: () => void;
  barcode: string;
  description: string;
  setDescription: (v: string) => void;
  isLoading: boolean;
  handleSubmit: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-md"
        onClose={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Product Damaged
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Barcode info */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Barcode className="w-3 h-3" />
              Barcode
            </Label>
            <div className="px-3 py-2 border rounded bg-gray-50 text-sm font-mono">
              {barcode || "-"}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold">
              Damage Description
            </Label>
            <Textarea
              placeholder="Describe the damage condition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="bg-orange-400/80 hover:bg-orange-400 text-black"
              disabled={!description || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
