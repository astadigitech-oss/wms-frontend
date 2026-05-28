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
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
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

type BagItem = {
  id: string;
  barcode_bag: string;
  name_bag: string;
  total_product: number;
  price: number;
  status?: string;
  category_bag?: string;
};

type CategoryItem = {
  id: string | number;
  name_category?: string;
  discount_category?: string;
  max_price_category?: string | number;
};

export const Client = () => {
  const [dataSearch, setDataSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [isOpenAddBag, setIsOpenAddBag] = useState(false);
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
    q: dataSearch,
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

  const listCategory: CategoryItem[] = useMemo(() => {
    return dataCategory?.data?.data?.resource ?? [];
  }, [dataCategory]);

  const isLoadingCategory = isPendingCategory || isRefetchingCategory;
  const isLoadingBag = isPendingBag || isRefetchingBag;

  const dataListBag: BagItem[] = useMemo(() => {
    const resource = dataBag?.data?.data?.resource;

    if (Array.isArray(resource)) return resource;
    if (Array.isArray(resource?.data)) return resource.data;
    if (Array.isArray(dataBag?.data?.data)) return dataBag.data.data;

    return [];
  }, [dataBag]);

  const filteredBag = useMemo(() => {
    const search = dataSearch.toLowerCase().trim();

    if (!search) return dataListBag;

    return dataListBag.filter((bag) =>
      [
        bag.barcode_bag,
        bag.name_bag,
        bag.status,
        String(bag.total_product),
        String(bag.price),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [dataListBag, dataSearch]);

  const totalBag = dataListBag.length;
  const totalHarga = dataListBag.reduce(
    (total, bag) => total + Number(bag.price ?? 0),
    0,
  );

  const handleSelectCategory = (category: CategoryItem) => {
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

  const columnBag: ColumnDef<BagItem>[] = [
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
        <div className="text-center capitalize">
          {row.original.status || "-"}
        </div>
      ),
    },
    {
      id: "action_out",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
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
          <TooltipProviderPage value="Remove Product">
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant="outline"
              // disabled={isPendingRemove}
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleRemoveProduct(row.original.id);
              // }}
            >
              {/* {isPendingRemove ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : ( */}
              <Trash2 className="w-4 h-4" />
              {/* )} */}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const columnCategory: ColumnDef<CategoryItem>[] = [
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
                {totalBag.toLocaleString()}
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
                {formatRupiah(totalHarga)}
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
                value={dataSearch}
                onChange={(e) => {
                  setPage(1);
                  setDataSearch(e.target.value);
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
            data={filteredBag}
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
