"use client";

import Loading from "@/app/(dashboard)/loading";
import Forbidden from "@/components/403";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { usePagination } from "@/lib/pagination";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  Loader2,
  Package,
  RefreshCw,
  ScanText,
  Search,
  ShoppingBag,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAddBagCargo, useGetDetailCargo, useRemoveBagCargo } from "../_api";

type BagCargo = {
  id: string;
  barcode_bag?: string;
  name_bag?: string;
  total_product?: number;
  price?: number;
  status?: string;
};

type CargoDetail = {
  code_document_bulky?: string;
  name_document?: string;
  total_product_bulky?: number;
  total_old_price_bulky?: number;
  total_bag?: number;
  status_bulky?: string;
};

const getCargoTotalBag = (cargo: CargoDetail | undefined, bags: BagCargo[]) =>
  cargo?.total_bag ?? bags.length ?? 0;

export const Client = () => {
  const { cargoId } = useParams();
  const scanRef = useRef<HTMLInputElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const [searchBag, setSearchBag] = useState("");
  const { metaPage, page, setPage, setPagination } =
    usePagination("pageCargoBag");

  const [RemoveBagDialog, confirmRemoveBag] = useConfirm(
    "Remove Bag Cargo",
    "This action cannot be undone.",
    "destructive",
  );

  const { data, refetch, isPending, isRefetching, isSuccess, error, isError } =
    useGetDetailCargo({
      id: cargoId,
      p: page,
      q: searchBag,
    });

  const { mutate: addBag, isPending: isPendingAddBag } = useAddBagCargo();
  const { mutate: removeBag, isPending: isPendingRemoveBag } =
    useRemoveBagCargo();

  const dataResource = data?.data?.data?.resource;
  const cargo: CargoDetail = dataResource ?? {};
  const bags: BagCargo[] = useMemo(() => {
    return dataResource?.data ?? [];
  }, [dataResource]);

  const loading = isPending || isRefetching;

  const handleScanSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const barcodeBag = scanValue.trim();
    if (!barcodeBag || isPendingAddBag) return;

    addBag(
      {
        cargoId: cargoId,
        body: {
          barcode_bag: barcodeBag,
        },
      },
      {
        onSuccess: () => {
          setScanValue("");
          refetch();
          scanRef.current?.focus();
        },
      },
    );
  };

  const handleRemoveBag = async (bagId: string) => {
    const ok = await confirmRemoveBag();
    if (!ok) return;

    removeBag(
      {
        cargoId: cargoId,
        body: {
          bag_product_id: bagId,
        },
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Detail Cargo",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    if (isSuccess && dataResource) {
      setPagination(dataResource);
    }
  }, [dataResource, isSuccess]);

  const columnBag: ColumnDef<BagCargo>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(row.index + 1).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "barcode_bag",
      header: "Barcode Bag",
      cell: ({ row }) => (
        <div className="max-w-[280px] break-all">
          {row.original.barcode_bag ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "name_bag",
      header: "Name Bag",
      cell: ({ row }) => (
        <div className="max-w-[420px] break-all">
          {row.original.name_bag ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "total_product",
      header: () => <div className="text-center">Total Item</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(row.original.total_product ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: () => <div className="text-center">Harga Asal</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.price ?? 0)}
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
              "rounded min-w-20 justify-center text-black font-normal capitalize",
              row.original.status === "done" &&
                "bg-green-400 hover:bg-green-400",
              row.original.status === "process" &&
                "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.status ?? "-"}
          </Badge>
        </div>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TooltipProviderPage value="Remove Bag">
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant="outline"
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
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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
      <RemoveBagDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/cargo-new/cargo">
              Cargo
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full rounded-md border border-sky-400/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Detail Cargo {cargo?.code_document_bulky}
            </h2>
            <p className="mt-1 break-all text-sm text-gray-500">
              {cargo?.name_document ?? cargo?.code_document_bulky ?? "-"}
            </p>
          </div>
          <TooltipProviderPage value="Reload Data">
            <Button
              onClick={() => refetch()}
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
              variant="outline"
            >
              <RefreshCw
                className={cn("w-4 h-4", loading ? "animate-spin" : "")}
              />
            </Button>
          </TooltipProviderPage>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Item</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {(cargo?.total_product_bulky ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                <Package className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Harga Asal</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {formatRupiah(cargo?.total_old_price_bulky ?? 0)}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <WalletCards className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bag</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {getCargoTotalBag(cargo, bags).toLocaleString()}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-violet-100 text-violet-700">
                <ShoppingBag className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "rounded min-w-24 justify-center text-black font-normal capitalize",
                      cargo?.status_bulky === "done" &&
                        "bg-green-400 hover:bg-green-400",
                      cargo?.status_bulky === "process" &&
                        "bg-yellow-400 hover:bg-yellow-400",
                    )}
                  >
                    {cargo?.status_bulky ?? "-"}
                  </Badge>
                </div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <ScanText className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full rounded-md border border-sky-400/80 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">Scan Bag Cargo</h2>
        <form
          className="mt-4 flex w-full flex-col gap-3 md:flex-row md:items-center"
          onSubmit={handleScanSubmit}
        >
          <div className="relative w-full md:w-2/5">
            <ScanText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={scanRef}
              className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="Scan barcode bag..."
              disabled={isPendingAddBag}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            variant="liquid"
            disabled={!scanValue.trim() || isPendingAddBag}
          >
            {isPendingAddBag ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ScanText className="size-4" />
            )}
            Scan Bag
          </Button>
        </form>
      </div>

      <div className="w-full rounded-md border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">List Bag</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-2/5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                value={searchBag}
                onChange={(e) => {
                  setPage(1);
                  setSearchBag(e.target.value);
                }}
                placeholder="Search bag..."
              />
            </div>
            <TooltipProviderPage value="Reset Search">
              <Button
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
                onClick={() => {
                  setPage(1);
                  setSearchBag("");
                  refetch();
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipProviderPage>
          </div>

          <DataTable
            columns={columnBag}
            data={bags}
            isLoading={loading}
            isSticky
            maxHeight="h-[45vh]"
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
