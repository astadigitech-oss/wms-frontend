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
import { useSearchQuery } from "@/lib/search";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { Loader2, RefreshCw, ScanText, Search, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useAddProductBag,
  useGetDetailBag,
  useGetInfoBag,
  useRemoveProductBag,
} from "../_api";

type ProductBag = {
  id: string;
  new_barcode_product?: string;
  barcode_bulky_sale?: string;
  barcode?: string;
  qty?: number;
  old_price_bulky_sale?: number;
  old_price_product?: number;
  old_price?: number;
};

const getBarcode = (product: ProductBag) =>
  product.new_barcode_product ??
  product.barcode_bulky_sale ??
  product.barcode ??
  "-";

const getOldPrice = (product: ProductBag) =>
  product.old_price_bulky_sale ??
  product.old_price_product ??
  product.old_price ??
  0;

const productColumns = (
  handleRemoveProduct: (id: string) => void,
  isPendingRemove: boolean,
): ColumnDef<ProductBag>[] => [
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
    id: "new_barcode",
    header: "New Barcode",
    cell: ({ row }) => (
      <div className="max-w-[420px] break-all">{getBarcode(row.original)}</div>
    ),
  },
  {
    accessorKey: "qty",
    header: () => <div className="text-center">Qty</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(row.original.qty ?? 1).toLocaleString()}
      </div>
    ),
  },
  {
    id: "old_price",
    header: () => <div className="text-center">Old Price</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {formatRupiah(getOldPrice(row.original))}
      </div>
    ),
  },
  {
    id: "action_out",
    header: () => <div className="text-center">Action Out</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TooltipProviderPage value="Remove Product">
          <Button
            className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
            variant="outline"
            disabled={isPendingRemove}
            onClick={(e) => {
              e.preventDefault();
              handleRemoveProduct(row.original.id);
            }}
          >
            {isPendingRemove ? (
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

export const Client = () => {
  const { bagId } = useParams();
  const scanRef = useRef<HTMLInputElement | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { search, searchValue, setSearch } = useSearchQuery("qProduct");
  const { metaPage, page, setPage, setPagination } =
    usePagination("pageProduct");

  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove Product",
    "This action cannot be undone.",
    "destructive",
  );

  const { data, isPending, isRefetching, isSuccess, refetch, error, isError } =
    useGetDetailBag({
      id: bagId,
      p: page,
      q: searchValue,
    });
  const {
    data: dataInfo,
    isPending: isPendingInfo,
    isRefetching: isRefetchingInfo,
    refetch: refetchInfo,
    error: errorInfo,
    isError: isErrorInfo,
  } = useGetInfoBag({
    id: bagId,
  });

  const { mutate: addProduct, isPending: isPendingAddProduct } =
    useAddProductBag();
  const { mutate: removeProduct, isPending: isPendingRemoveProduct } =
    useRemoveProductBag();

  const dataResource = data?.data?.data?.resource;
  const dataInfoResource = dataInfo?.data?.data?.resource;
  const bag =
    dataInfoResource?.bag_product ??
    dataInfoResource?.bag ??
    dataInfoResource?.bag_info ??
    dataInfoResource?.data ??
    dataInfoResource ??
    dataResource?.bag_product ??
    {};
  const products: ProductBag[] = useMemo(() => {
    return dataResource?.data ?? [];
  }, [dataResource]);

  const isLoading = isPending || isRefetching;
  const isInfoLoading = isPendingInfo || isRefetchingInfo;
  const isBagDone = bag?.status === "done";

  const handleAddProduct = (barcode: string) => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode || isPendingAddProduct || isBagDone) return;

    addProduct(
      {
        id: bagId,
        body: {
          barcode_product: trimmedBarcode,
        },
      },
      {
        onSuccess: () => {
          setScanValue("");
          refetch();
          refetchInfo();
          scanRef.current?.focus();
        },
      },
    );
  };

  const handleScanSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAddProduct(scanValue);
  };

  const handleRemoveProduct = async (id: string) => {
    const ok = await confirmRemove();
    if (!ok) return;

    removeProduct(
      { id, body: {} },
      {
        onSuccess: () => {
          refetch();
          refetchInfo();
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(dataResource ?? {});
    }
  }, [data, dataResource, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Bag",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    alertError({
      isError: isErrorInfo,
      error: errorInfo as AxiosError,
      data: "Info Detail Bag",
      action: "get data",
      method: "GET",
    });
  }, [isErrorInfo, errorInfo]);

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isError && (error as AxiosError)?.status === 403) ||
    (isErrorInfo && (errorInfo as AxiosError)?.status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RemoveDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/cargo-new/bag">Bag</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full flex flex-col gap-4">
        <div className="rounded-md border border-sky-400/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <h2 className="text-xl font-bold">Detail Bag</h2>
              <p className="text-sm text-gray-500">
                Detail informasi dan produk dalam bag.
              </p>
            </div>
            <TooltipProviderPage value="Reload Data">
              <Button
                onClick={() => {
                  refetch();
                  refetchInfo();
                }}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    isLoading || isInfoLoading ? "animate-spin" : "",
                  )}
                />
              </Button>
            </TooltipProviderPage>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-md md:grid-cols-2">
            <div className="p-4 ">
              <p className="text-xs text-gray-500">Barcode Bag</p>
              <p className="mt-1 break-all text-lg font-semibold">
                {bag?.barcode_bag ?? "-"}
              </p>
            </div>
            <div className=" p-4 ">
              <p className="text-xs text-gray-500">Name Bag</p>
              <p className="mt-1 break-all text-lg font-semibold capitalize">
                {bag?.name_bag ?? "-"}
              </p>
            </div>
            <div className=" p-4 ">
              <p className="text-xs text-gray-500">Qty</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold tabular-nums">
                  {(bag?.total_product ?? 0).toLocaleString()}
                </p>
                {/* <Package className="size-5 text-sky-700" /> */}
              </div>
            </div>
            <div className=" p-4">
              <p className="text-xs text-gray-500">Total Price</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold tabular-nums">
                  {formatRupiah(bag?.total_old_price_bulky_sale ?? 0)}
                </p>
                {/* <WalletCards className="size-5 text-emerald-700" /> */}
              </div>
            </div>
            <div className=" p-4 md:col-span-2">
              <p className="text-xs text-gray-500">Status</p>
              <Badge
                className={cn(
                  "mt-2 rounded px-3 py-1 text-black font-normal capitalize",
                  bag?.status === "process" &&
                    "bg-yellow-400 hover:bg-yellow-400",
                  bag?.status === "done" && "bg-green-400 hover:bg-green-400",
                )}
              >
                {bag?.status ?? "-"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-sky-400/80 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Scan Product</h2>
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
                placeholder="Scan barcode product..."
                disabled={isPendingAddProduct || isBagDone}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              variant="liquid"
              disabled={!scanValue.trim() || isPendingAddProduct || isBagDone}
            >
              {isPendingAddProduct ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanText className="size-4" />
              )}
              Scan Product
            </Button>
          </form>
        </div>

        <div className="rounded-md border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-bold">List Product</h2>
            </div>
            <div className="flex items-center gap-3 w-full md:w-2/5">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search product..."
                />
              </div>
              <TooltipProviderPage value="Reset Search">
                <Button
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant="outline"
                  onClick={() => {
                    refetch();
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipProviderPage>
            </div>

            <DataTable
              isSticky
              maxHeight="h-[45vh]"
              isLoading={isLoading}
              columns={productColumns(
                handleRemoveProduct,
                isPendingRemoveProduct,
              )}
              data={products}
            />
            <Pagination
              pagination={{ ...metaPage, current: page }}
              setPagination={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
