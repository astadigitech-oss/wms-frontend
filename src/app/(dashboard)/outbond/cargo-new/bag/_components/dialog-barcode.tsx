"use client";

import OnlyQRPrinted from "@/components/qr-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DialogBarcode = ({
  open,
  onCloseModal,
  barcode,
  qty,
  batch,
  name,
  handleCancel,
}: {
  open: boolean;
  onCloseModal: () => void;
  barcode: any;
  qty: any;
  batch?: any;
  name?: any;
  handleCancel: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>QR Printered</DialogTitle>
        </DialogHeader>
        <OnlyQRPrinted
          qr={barcode ?? ""}
          qty={qty ?? ""}
          batch={batch ?? ""}
          name={name ?? ""}
          cancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogBarcode;
