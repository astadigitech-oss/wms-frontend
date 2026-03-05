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

import React, { FormEvent, useEffect, useState } from "react";
import { useUpdateCargoOnline } from "../_api/use-update-cargo-online";

export const DialogVolume = ({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: () => void;
  data: any;
}) => {
  const [volume, setVolume] = useState({
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  const { mutate: createVolume } = useUpdateCargoOnline();

  // const handleApply = (e: FormEvent) => {
  //   e.preventDefault();

  //   setData((prev: any) => ({
  //     ...prev,
  //     weight: volume.weight,
  //     length: volume.length,
  //     width: volume.width,
  //     height: volume.height,
  //   }));

  //   onOpenChange();
  // };

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();

    createVolume(
      {
        id: data?.id, // ⬅ bulky document id (12)
        body: {
          weight: volume.weight,
          length: volume.length,
          width: volume.width,
          height: volume.height,
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
      setVolume({
        weight: data?.weight || "",
        length: data?.length || "",
        width: data?.width || "",
        height: data?.height || "",
      });
    } else {
      setVolume({
        weight: "",
        length: "",
        width: "",
        height: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Volume Cargo Online</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <form onSubmit={handleApply} className="w-full flex flex-col gap-4">
          {/* Berat */}
          <div className="flex flex-col gap-1 w-full relative">
            <Label>Berat (kg)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={volume.weight}
              onChange={(e) => setVolume({ ...volume, weight: e.target.value })}
              className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
            />
          </div>

          {/* Panjang */}
          <div className="flex flex-col gap-1 w-full relative">
            <Label>Panjang (cm)</Label>
            <Input
              type="number"
              placeholder="0"
              value={volume.length}
              onChange={(e) => setVolume({ ...volume, length: e.target.value })}
              className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
            />
          </div>

          {/* Lebar */}
          <div className="flex flex-col gap-1 w-full relative">
            <Label>Lebar (cm)</Label>
            <Input
              type="number"
              placeholder="0"
              value={volume.width}
              onChange={(e) => setVolume({ ...volume, width: e.target.value })}
              className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
            />
          </div>

          {/* Tinggi */}
          <div className="flex flex-col gap-1 w-full relative">
            <Label>Tinggi (cm)</Label>
            <Input
              type="number"
              placeholder="0"
              value={volume.height}
              onChange={(e) => setVolume({ ...volume, height: e.target.value })}
              className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500"
            />
          </div>

          <div className="flex w-full gap-2">
            <Button
              variant={"outline"}
              className="border-black w-full"
              onClick={onOpenChange}
              type="button"
            >
              Cancel
            </Button>

            <Button
              className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
              type="submit"
            >
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
