"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  useExportDetailDataCargo,
  useFinishCargo,
  useGetDetailCargo,
  useRemoveBagCargo,
} from "../_api";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { cn, formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Loader2,
  Printer,
  ReceiptText,
  RefreshCw,
  SaveIcon,
  Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Loading from "@/app/(dashboard)/loading";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { parseAsBoolean, useQueryState } from "nuqs";
import dynamic from "next/dynamic";
import DialogDetail from "./dialog-detail";
import { useConfirm } from "@/hooks/use-confirm";

const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});

export const Client = () => {
  const { cargoId } = useParams();
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [selectedBarcodeBag, setSelectedBarcodeBag] = useState("");
  const [selectedTotalProductBag, setSelectedTotalProductBag] = useState("");

  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove Bag",
    "This action cannot be undone.",
    "destructive"
  );

  const [FinishDialog, confirmFinish] = useConfirm(
    "Finish Cargo",
    "This action cannot be undone",
    "liquid"
  );

  const [idBagCargo, setIdBagCargo] = useQueryState("bagId", { defaultValue: "" });

  const { data, refetch, isRefetching, error, isError } = useGetDetailCargo({
    id: cargoId,
  });

  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportDetailDataCargo();
  const { mutate: removeBag, isPending: isPendingRemoveBag } =
    useRemoveBagCargo();
  const { mutate: finishCargo, isPending: isPendingFinishCargo } = useFinishCargo({
    cargoId,
  });
  // memo data detail
  const dataListDetail: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataListBag: any[] = useMemo(() => {
    return data?.data?.data?.resource?.bag_products ?? [];
  }, [data]);

  // handle export
  const handleExport = async () => {
    mutateExport(
      { id: cargoId },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }
    );
  };

  const handleRemoveBag = async (id: string) => {
    const ok = await confirmRemove();

    if (!ok) return;

    removeBag(
      { id },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleFinish = async () => {
    const ok = await confirmFinish();

    if (!ok) return;

    finishCargo(
      {},
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  // column data detail
  const columnCargoDetail: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "barcode_bag",
      header: "Barcode",
    },
    {
      accessorKey: "name_bag",
      header: () => <div className="text-center">Name Bag</div>,
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">{row.original.name_bag}</div>
      ),
    },
    {
      accessorKey: "total_product",
      header: "Total Product",
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.total_product}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {formatRupiah(row.original.price)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status === "process" &&
                "bg-yellow-400 hover:bg-yellow-400",
              row.original.status === "done" &&
                "bg-green-400 hover:bg-green-400"
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setIdBagCargo(row.original.id);
                setOpenDetail(true);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Print Barcode</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setSelectedBarcodeBag(row.original.barcode_bag);
                setSelectedTotalProductBag(row.original.total_product);
                setBarcodeOpen(true);
              }}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete Bag</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingRemoveBag}
              onClick={(e) => {
                e.preventDefault();
                handleRemoveBag(row.original.id);
              }}
            >
              {isPendingRemoveBag ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{" "}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RemoveDialog />
      <FinishDialog />
      <DialogDetail
        open={openDetail}
        onCloseModal={() => {
          if (openDetail) {
            setOpenDetail(false);
            setIdBagCargo("");
          }
        }}
        idBagCargo={idBagCargo}
      />
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        barcode={selectedBarcodeBag}
        qty={selectedTotalProductBag}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/cargo">Cargo</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex flex-col gap-5 mt-5">
        <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-5 flex-col">
          <div className="flex w-full border-sky-400/80 rounded-md overflow-hidden border p-4 flex-col">
            <div className="w-full flex items-center">
              <div className="flex items-center w-full">
                <div className="flex w-full items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Name Buyer</p>
                    <p className="font-semibold capitalize text-lg">
                      {dataListDetail?.name_buyer}
                    </p>
                  </div>
                </div>
                 <Separator
                  orientation="vertical"
                  className="bg-gray-500 h-20"
                />
                <div className="flex w-full pl-5 items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Type</p>
                    <p className="font-semibold capitalize text-lg">
                      {dataListDetail?.type}
                    </p>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="bg-gray-500 h-20"
                />
                <div className="flex w-full pl-5 items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Document Code</p>
                    <p className="font-semibold capitalize text-lg">
                      {dataListDetail?.code_document_bulky}
                    </p>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="bg-gray-500 h-20"
                />
                <div className="flex w-full pl-5 items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Discount</p>
                    <p className="font-semibold capitalize text-lg">
                      {dataListDetail?.discount_bulky?.toLocaleString()}%
                    </p>
                  </div>
                </div>
              </div>
              <Separator orientation="vertical" className="bg-gray-500 h-20" />
              <div className="flex items-center gap-4 ml-4">
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      refetch();
                    }}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    variant={"outline"}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4",
                        isRefetching ? "animate-spin" : ""
                      )}
                    />
                  </Button>
                </TooltipProviderPage>
              </div>
            </div>
            <Separator className="bg-gray-500" />
            <div className="w-full flex items-center">
              <div className="flex items-center w-full">
                <div className="flex w-full items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Total Product</p>
                    <p className="font-semibold capitalize text-lg">
                      {dataListDetail?.total_product_bulky.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="bg-gray-500 h-20"
                />
                <div className="flex w-full pl-5 items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Total Bag</p>
                    <p className="font-semibold capitalize text-lg">
                      {dataListDetail?.total_bag.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="bg-gray-500 h-20"
                />
                <div className="flex w-full pl-5 items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Total Old Price</p>
                    <p className="font-semibold capitalize text-lg">
                      {formatRupiah(dataListDetail?.total_old_price_bulky)}
                    </p>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="bg-gray-500 h-20"
                />
                <div className="flex w-full pl-5 items-end gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs">Total New Price</p>
                    <p className="font-semibold capitalize text-lg">
                      {formatRupiah(dataListDetail?.after_price_bulky)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-4">
          <Button
            variant={"liquid"}
            type="button"
            onClick={() => handleExport()}
            disabled={isPendingExport}
          >
            <FileDown className="size-4 ml-1" />
            Export Data
          </Button>
          <Button
            type="button"
            onClick={handleFinish}
            variant={"liquid"}
            disabled={
              dataListDetail?.status_bulky === "selesai" || isPendingFinishCargo
            }
          >
            <SaveIcon />
            Finish
          </Button>
        </div>
        <DataTable
          maxHeight="h-[45vh]"
          isSticky
          isLoading={isRefetching}
          columns={columnCargoDetail}
          data={dataListBag}
        />
      </div>
    </div>
  );
};
