"use client";

import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAddBag, useGetListBag, useGetListCategory } from "../_api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});

export const Client = () => {
  const [categorySearch, setCategorySearch] = useState("");
  const [isOpenAddBag, setIsOpenAddBag] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [selectedBarcodeBag, setSelectedBarcodeBag] = useState("");
  const [selectedTotalProductBag, setSelectedTotalProductBag] = useState("");
  const [selectedNameBag, setSelectedNameBag] = useState("");
  const { search, searchValue, setSearch } = useSearchQuery("searchBag");
  const { metaPage, page, setPage, setPagination } = usePagination("pageBag");

  const { mutate: addBag, isPending: isPendingAddBag } = useAddBag();
  const {
    data: dataBag,
    refetch: refetchBag,
    isPending: isPendingBag,
    isRefetching: isRefetchingBag,
    error: errorBag,
    isError: isErrorBag,
    isSuccess: isSuccessBag,
  } = useGetListBag({
    p: page,
    q: searchValue,
  });

  const {
    data: dataCategory,
    refetch: refetchCategory,
    isPending: isPendingCategory,
    isRefetching: isRefetchingCategory,
    error: errorCategory,
    isError: isErrorCategory,
  } = useGetListCategory({
    q: categorySearch,
  });

  const listCategory: any = useMemo(() => {
    return dataCategory?.data?.data?.resource ?? [];
  }, [dataCategory]);

  const isLoadingCategory = isPendingCategory || isRefetchingCategory;
  const isLoadingBag = isPendingBag || isRefetchingBag;

  const dataListBag = useMemo(() => {
    return dataBag?.data?.data?.resource;
  }, [dataBag]);

  const listBag: any = useMemo(() => {
    return dataListBag?.data ?? [];
  }, [dataListBag]);

  const handleSelectCategory = (category: any) => {
    if (isPendingAddBag) return;

    addBag(
      {
        body: {
          category_id: category.id,
        },
      },
      {
        onSuccess: () => {
          setIsOpenAddBag(false);
          setCategorySearch("");
        },
      },
    );
  };

  useEffect(() => {
    if (isOpenAddBag) {
      refetchCategory();
    }
  }, [isOpenAddBag, refetchCategory]);

  useEffect(() => {
    if (!isOpenAddBag) return;

    const timeout = setTimeout(() => {
      refetchCategory();
    }, 300);

    return () => clearTimeout(timeout);
  }, [categorySearch, isOpenAddBag, refetchCategory]);

  useEffect(() => {
    alertError({
      isError: isErrorCategory,
      error: errorCategory as AxiosError,
      data: "Data Category",
      action: "get data",
      method: "GET",
    });
  }, [isErrorCategory, errorCategory]);

  useEffect(() => {
    alertError({
      isError: isErrorBag,
      error: errorBag as AxiosError,
      data: "Data Bag",
      action: "get data",
      method: "GET",
    });
  }, [isErrorBag, errorBag]);

  useEffect(() => {
    const resource = dataBag?.data?.data?.resource;

    if (isSuccessBag && resource && !Array.isArray(resource)) {
      setPagination(resource);
    }
  }, [dataBag, isSuccessBag]);

  const columnBag: ColumnDef<any>[] = [
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
      header: "Barcode",
    },
    {
      accessorKey: "name_bag",
      header: "Name Bag",
      cell: ({ row }) => (
        <div className="max-w-[420px] break-all">{row.original.name_bag}</div>
      ),
    },
    {
      accessorKey: "total_product",
      header: () => <div className="text-center">Total Product</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.total_product.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "category_bag ",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[420px] break-all">
          {row.original.category_bag ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        // <div className="text-center capitalize">
        //   {row.original.status || "-"}
        // </div>
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded min-w-20 justify-center text-black font-normal capitalize",
              row.original.status?.toLowerCase() === "done"
                ? "bg-green-400 hover:bg-green-400"
                : "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.status ?? "-"}
          </Badge>
        </div>
      ),
    },
    {
      id: "action_out",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipProviderPage value="Print Barcode">
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setSelectedBarcodeBag(row.original.barcode_bag ?? "");
                setSelectedTotalProductBag(
                  row.original.total_product === undefined ||
                    row.original.total_product === null
                    ? ""
                    : String(row.original.total_product),
                );
                setSelectedNameBag(row.original.name_bag ?? "");
                setBarcodeOpen(true);
              }}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Detail Bag">
            <Button
              asChild
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant="outline"
            >
              <Link href={`/outbond/cargo-new/bag/detail/${row.original.id}`}>
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const columnCategory: ColumnDef<any>[] = [
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
      accessorKey: "name_category",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="max-w-[420px] break-all">
          {row.original.name_category ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "discount_category",
      header: () => <div className="text-center">Discount</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.discount_category ?? "0"}%
        </div>
      ),
    },
    {
      accessorKey: "max_price_category",
      header: () => <div className="text-center">Max Price</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(Number(row.original.max_price_category ?? 0))}
        </div>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-sky-400 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
            disabled={isPendingAddBag}
            onClick={() => handleSelectCategory(row.original)}
          >
            {isPendingAddBag ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Select
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        barcode={selectedBarcodeBag}
        qty={selectedTotalProductBag}
        name={selectedNameBag}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
      />
      <Dialog open={isOpenAddBag} onOpenChange={setIsOpenAddBag}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Select Category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-2/5">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search category..."
                  autoFocus
                />
              </div>
              <TooltipProviderPage value="Reload Category">
                <Button
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant="outline"
                  onClick={() => refetchCategory()}
                  disabled={isLoadingCategory}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isLoadingCategory ? "animate-spin" : "",
                    )}
                  />
                </Button>
              </TooltipProviderPage>
            </div>

            <DataTable
              columns={columnCategory}
              data={listCategory}
              isLoading={isLoadingCategory}
              isSticky
              maxHeight="h-[60vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
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
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-500">Total Bag</p>
              <p className="text-2xl font-bold tabular-nums">
                {dataListBag?.total}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-md bg-sky-100 text-sky-700">
              <Package className="size-5" />
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-500">Total Harga</p>
              <p className="text-2xl font-bold tabular-nums">
                {formatRupiah(20000)}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <WalletCards className="size-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-5 flex-col">
        <h2 className="text-xl font-bold">List Bag</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-2/5">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search bag..."
                autoFocus
              />
            </div>
            <div className="flex items-center gap-3">
              <TooltipProviderPage value="Reload Bag">
                <Button
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant="outline"
                  onClick={() => refetchBag()}
                  disabled={isLoadingBag}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isLoadingBag ? "animate-spin" : "",
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <Button
                variant="liquid"
                onClick={() => setIsOpenAddBag(true)}
                disabled={isPendingAddBag}
              >
                {isPendingAddBag ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add Bag
              </Button>
            </div>
          </div>

          <DataTable
            columns={columnBag}
            data={listBag}
            isLoading={isLoadingBag}
            isSticky
            maxHeight="h-[55vh]"
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
