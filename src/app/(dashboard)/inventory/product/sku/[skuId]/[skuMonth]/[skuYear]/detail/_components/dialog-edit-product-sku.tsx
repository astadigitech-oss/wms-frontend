"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useEditProductSku } from "../_api/use-edit-product-sku";

type DialogEditProductSkuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSuccess?: () => void;
};

const normalizeNumber = (value: any) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const DialogEditProductSku = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}: DialogEditProductSkuProps) => {
  const { mutate, isPending } = useEditProductSku();
  const [input, setInput] = useState({
    price: "0",
    qty: "0",
  });

  useEffect(() => {
    if (!open || !product) return;

    setInput({
      price: String(normalizeNumber(product.price_product)),
      qty: String(normalizeNumber(product.quantity_product)),
    });
  }, [open, product]);

  const handleClose = () => {
    onOpenChange(false);
    setInput({ price: "0", qty: "0" });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    mutate(
      {
        id: product.id,
        body: {
          harga: normalizeNumber(input.price),
          qty: normalizeNumber(input.qty),
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Product SKU</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>Description Barang</Label>
            <Textarea
              value={product?.name_product ?? ""}
              disabled
              rows={3}
              className="resize-none disabled:opacity-100 disabled:cursor-default"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="skuPrice">Price</Label>
              <Input
                id="skuPrice"
                type="number"
                min={0}
                value={input.price}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    price: e.target.value.replace(/^0+(?=\d)/, ""),
                  }))
                }
                required
              />
              <p className="text-xs text-gray-500">
                {formatRupiah(normalizeNumber(input.price))}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="skuQty">Qty</Label>
              <Input
                id="skuQty"
                type="number"
                min={0}
                value={input.qty}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    qty: e.target.value.replace(/^0+(?=\d)/, ""),
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full bg-sky-400 hover:bg-sky-400/80 text-black"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
