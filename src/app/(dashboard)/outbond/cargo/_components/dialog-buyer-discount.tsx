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

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { DialogBuyer } from "./dialog-buyer"; // ⬅ import dialog buyer
import { useCreateSale } from "../_api/use-create-sale";

export const DialogBuyerDiscount = ({
  open,
  onOpenChange,
  data,
  //   setData,
}: {
  open: boolean;
  onOpenChange: () => void;
  data: any;
  setData: any;
}) => {
  const [openBuyer, setOpenBuyer] = useState(false);
  const [buyer, setBuyer] = useState<any>(null);
  const [discount, setDiscount] = useState<number>(0);
  console.log("data bulky", data);
  console.log("buyer", buyer);
  const price = Number(data?.total_old_price_bulky || 0);

  const totalAfterDiscount = useMemo(() => {
    const discountAmount = (discount / 100) * price;
    return price - discountAmount;
  }, [discount, price]);
  const { mutate: createSaleBulky } = useCreateSale();

  const isCargoOnline = data?.type?.toLowerCase() === "cargo online";
  const handleApply = async (e: FormEvent) => {
    e.preventDefault();

    createSaleBulky(
      {
        id: data?.id, // ⬅ bulky document id (12)
        body: {
          buyer_id: buyer?.buyer_id || data?.buyer_id, // fallback ke buyer lama kalau tidak ganti
          discount_bulky: discount,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(); // tutup dialog
        },
      },
    );
  };

  useEffect(() => {
    if (open) {
      setBuyer(buyer || null);
      setDiscount(data?.discount || 0);
    } else {
      setBuyer(null);
      setDiscount(0);
    }
  }, [open]);

  return (
    <>
      {/* Dialog Buyer Discount */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale {data?.name_document}</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <form onSubmit={handleApply} className="flex flex-col gap-4">
            {/* Buyer */}
            {!isCargoOnline && (
              <div className="flex flex-col gap-1">
                <Label>Buyer</Label>
                <div className="flex gap-2">
                  <Input
                    value={buyer?.name_buyer || data?.name_buyer || ""}
                    placeholder="Select buyer"
                    disabled
                    className="bg-gray-100 border-0 border-b rounded-none"
                  />
                  <Button
                    type="button"
                    onClick={() => setOpenBuyer(true)}
                    variant="outline"
                  >
                    Select
                  </Button>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex flex-col gap-1">
              <Label>Price</Label>
              <Input
                value={price.toLocaleString("id-ID")}
                disabled
                className="bg-gray-100 border-0 border-b rounded-none"
              />
            </div>

            {/* Discount */}
            {!isCargoOnline && (
              <div className="flex flex-col gap-1">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="border-0 border-b rounded-none"
                />
              </div>
            )}

            {/* Total */}
            <div className="flex flex-col gap-1">
              <Label>Total After Discount</Label>
              <Input
                value={totalAfterDiscount.toLocaleString("id-ID")}
                disabled
                className="bg-green-50 text-green-700 font-semibold border-0 border-b rounded-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onOpenChange}
                className="w-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full">
                Sale
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Buyer Selector */}
      <DialogBuyer
        open={openBuyer}
        onOpenChange={() => setOpenBuyer(false)}
        setInput={(val: any) => {
          setBuyer(val);
          setOpenBuyer(false);
        }}
      />
    </>
  );
};
