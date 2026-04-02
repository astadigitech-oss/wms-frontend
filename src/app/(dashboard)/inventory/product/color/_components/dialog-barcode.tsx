"use client";

import OnlyQRPrinted from "@/components/qr-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

const DialogBarcode = ({
  open,
  onOpenChange,
  barcode,
  qty,
  name,
  handleCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode: any;
  qty: any;
  name: any;
  handleCancel: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>QR Printered</DialogTitle>
        </DialogHeader>

        <OnlyQRPrinted
          qr={barcode ?? ""}
          qty={qty ?? ""}
          name={name ?? ""}
          cancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogBarcode;
