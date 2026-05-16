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

import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import {
  X,
  Loader,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ScanBarcode,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { useActionProductPendingApproval } from "../../_api/use-approve-product-pending-approval";

interface Props {
  open: boolean;
  onCloseModal: () => void;
  baseData: any;
  miId: string;
  openDialog: string;
  setmiId: (value: string | null) => Promise<URLSearchParams>;
  setOpenDialog: (value: string | null) => Promise<URLSearchParams>;
}

/* ================= COMPONENT KECIL ================= */

const NodeForm = ({ label, value }: any) => (
  <div className="flex flex-col gap-1 w-full">
    <Label className="text-xs">{label}</Label>
    <Input
      disabled
      value={value ?? "-"}
      className="disabled:opacity-100 border-sky-400/80"
    />
  </div>
);

/* ================= MAIN ================= */

export const DialogDetailProductPendingApproval = ({
  open,
  onCloseModal,
  baseData,
  miId,
  openDialog,
  setmiId,
  setOpenDialog,
}: Props) => {
  const queryClient = useQueryClient();

  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Product",
    "This action cannot be undone",
    "liquid",
  );

  const [RejectDialog, confirmReject] = useConfirm(
    "Reject Product",
    "This action cannot be undone",
    "destructive",
  );

  const { mutate: mutateAction, isPending } = useActionProductPendingApproval();

  const { data, refetch, isLoading, isRefetching, error, isError } = baseData;

  const isLoadingButton = isPending || isRefetching;

  /* ================= DATA ================= */

  const resource = useMemo(() => {
    return open ? data?.data?.data?.resource : {};
  }, [data, open]);

  const oldData = resource?.comparison_data?.old_data ?? {};
  const newData = resource?.comparison_data?.new_data ?? {};

  const categoryOrTag =
    newData.new_category_product || newData.new_tag_product || "-";

  const getQuality = (qualityData: any) => {
    if (!qualityData) return "-";
    return (
      qualityData.lolos ??
      qualityData.damaged ??
      qualityData.abnormal ??
      qualityData.non ??
      "-"
    );
  };

  /* ================= ERROR ================= */

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Detail Product",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  /* ================= ACTION ================= */

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const ok =
      action === "approve" ? await confirmApprove() : await confirmReject();

    if (!ok) return;

    mutateAction(
      { id, action },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", { miId, openDialog }],
          });
          setmiId("");
          setOpenDialog("");
        },
      },
    );
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <ApproveDialog />
      <RejectDialog />

      <DialogContent
        onClose={false}
        className="min-w-[75vw]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Detail Perbandingan Data Untuk Approval{" "}
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onCloseModal()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>

        {/* LOADING */}
        {isLoading ? (
          <div className="w-full h-[70vh] flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* CARD */}
            <div className="border border-sky-400/80 rounded-md p-4 flex flex-col gap-4">
              {/* ACTION BAR */}
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-3">
                  <ScanBarcode className="size-4" />
                  <p className="font-semibold text-lg">
                    {newData.new_barcode_product}
                  </p>
                </div>

                <div className="flex gap-3">
                  <TooltipProviderPage value="Reload Data">
                    <Button
                      onClick={refetch}
                      variant="outline"
                      className="size-8 p-0 border-sky-400"
                      disabled={isLoadingButton}
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          isRefetching && "animate-spin",
                        )}
                      />
                    </Button>
                  </TooltipProviderPage>

                  <Button
                    className="bg-sky-400/80 hover:bg-sky-400 text-black"
                    size="sm"
                    disabled={isLoadingButton}
                    onClick={() =>
                      handleAction(resource?.notification_id, "approve")
                    }
                  >
                    <CheckCircle2 className="size-4 mr-1" />
                    Approve
                  </Button>

                  <Button
                    className="bg-red-400/80 hover:bg-red-400 text-black"
                    size="sm"
                    disabled={isLoadingButton}
                    onClick={() =>
                      handleAction(resource?.notification_id, "reject")
                    }
                  >
                    <XCircle className="size-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-4 w-full">
                  <h3 className="w-full text-center font-semibold text-lg py-2 bg-sky-100 border-b border-sky-300">
                    Old Data
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <NodeForm
                      label="Product Name"
                      value={oldData.old_name_product}
                    />
                    <NodeForm
                      label="Qty"
                      value={oldData.old_quantity_product}
                    />
                    <NodeForm
                      label="Price"
                      value={formatRupiah(oldData.old_price_product)}
                    />
                  </div>
                </div>

                <div className="h-full bg-sky-400/20 w-px" />

                <div className="flex flex-col gap-4 w-full">
                  <h3 className="w-full text-center font-semibold text-lg py-2 bg-sky-100 border-b border-sky-300">
                    New Data
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <NodeForm
                      label="Product Name"
                      value={newData.new_name_product}
                    />
                    <NodeForm label="Category" value={categoryOrTag} />

                    {/* Qty & Price */}
                    <div className="grid grid-cols-2 gap-4">
                      <NodeForm
                        label="Qty"
                        value={newData.new_quantity_product}
                      />
                      <NodeForm
                        label="Price"
                        value={formatRupiah(newData.new_price_product)}
                      />
                    </div>

                    {/* Status & Quality */}
                    <div className="grid grid-cols-2 gap-4">
                      <NodeForm
                        label="Status"
                        value={newData.new_status_product}
                      />
                      <NodeForm
                        label="Quality"
                        value={getQuality(newData.new_quality)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
