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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  Filter,
  Loader2,
  Package,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  useCreateCargo,
  useGetListCargo,
  useGetSummaryCargo,
  useGetListCategoryCargo,
} from "../_api";
import Link from "next/link";

type CargoType = "cargo offline" | "cargo online";

type Option = {
  value: string;
  label: string;
};

const getCategoryOptionList = (data: any): Option[] => {
  const resource =
    data?.data?.data?.resource?.data ??
    data?.data?.data?.resource ??
    data?.data?.data ??
    data?.data ??
    [];
  const list = Array.isArray(resource) ? resource : [];

  return list.map((item) => ({
    value: String(item?.id ?? item?.value ?? item?.category_id ?? item ?? ""),
    label: String(
      item?.category_name ?? item?.name ?? item?.label ?? item?.title ?? item?.category ?? "-",
    ),
  }));
};

const getSummaryValue = (summary: any | undefined, keys: string[]) => {
  if (!summary) return 0;

  for (const key of keys) {
    const value = summary[key as keyof any];
    if (typeof value === "number") return value;
  }

  return 0;
};

const formatCargoType = (type?: string) =>
  type?.replace(/cargo\s*/i, "") || "-";

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [cargoName, setCargoName] = useState("");
  const [cargoType, setCargoType] = useState<CargoType>("cargo offline");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [filterType, setFilterType] = useState("");
  const { search, searchValue, setSearch } = useSearchQuery();
  const { metaPage, page, setPage, setPagination } = usePagination();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListCargo({ p: page, q: searchValue, type: filterType });

  const {
    data: dataSummary,
    error: errorSummary,
    isError: isErrorSummary,
  } = useGetSummaryCargo();

  const {
    data: dataCategory,
    refetch: refetchCategory,
    isPending: isPendingCategory,
    isRefetching: isRefetchingCategory,
    error: errorCategory,
    isError: isErrorCategory,
  } = useGetListCategoryCargo({ q: categorySearch });

  const { mutate: createCargo, isPending: isPendingCreate } = useCreateCargo();

  const dataResource = data?.data?.data?.resource;
  const dataList: any = useMemo(() => {
    return dataResource?.data ?? [];
  }, [dataResource]);

  const summaryResource = dataSummary?.data?.data?.resource ?? {};
  const offlineSummary: any = summaryResource?.cargo_offline ?? {};
  const onlineSummary: any = summaryResource?.cargo_online ?? {};
  const loading = isLoading || isRefetching || isPending;

  const categoryOptions = useMemo(
    () => getCategoryOptionList(dataCategory),
    [dataCategory],
  );

  const handleCreateCargo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = cargoName.trim();
    if (!name || isPendingCreate) return;

    const body: any = {
      type: cargoType,
      name_document: name,
    };

    if (cargoType === "cargo online") {
      const categoryIdValue = categoryId || "";
      body.category_bulky_id = categoryIdValue;
      body.category_bulky_name = cargoName;
    }

    createCargo(
      {
        body,
      },
      {
        onSuccess: () => {
          setOpenCreate(false);
          setCargoName("");
          setCargoType("cargo offline");
          setCategoryId("");
          setCategorySearch("");
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess && dataResource) {
      setPagination(dataResource);
    }
  }, [dataResource, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Cargo",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    alertError({
      isError: isErrorSummary,
      error: errorSummary as AxiosError,
      data: "Summary Cargo",
      action: "get data",
      method: "GET",
    });
  }, [isErrorSummary, errorSummary]);

  useEffect(() => {
    if (!openCreate) return;

    refetchCategory();
  }, [openCreate, refetchCategory]);

  useEffect(() => {
    alertError({
      isError: isErrorCategory,
      error: errorCategory as AxiosError,
      data: "Data Category",
      action: "get data",
      method: "GET",
    });
  }, [isErrorCategory, errorCategory]);

  const columnCargo: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "code_document_bulky",
      header: "Code Document",
      cell: ({ row }) => (
        <div className="max-w-[260px] break-all">
          {row.original.code_document_bulky ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "name_document",
      header: "Nama Cargo",
      cell: ({ row }) => (
        <div className="max-w-[420px] break-all">
          {row.original.name_document ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "total_product_bulky",
      header: () => <div className="text-center">Total Item</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(row.original.total_product_bulky ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_old_price_bulky",
      header: () => <div className="text-center">Harga Asal</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.total_old_price_bulky ?? 0)}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => {
        const typeValue = row.original.type;
        const isOnline = typeValue?.toLowerCase() === "cargo online";

        return (
          <div className="flex justify-center">
            <Badge
              className={cn(
                "rounded w-20 justify-center px-0 text-black font-normal capitalize",
                isOnline
                  ? "bg-blue-400 hover:bg-blue-400"
                  : "bg-purple-400 hover:bg-purple-400",
              )}
            >
              {formatCargoType(typeValue)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status_bulky",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded min-w-20 justify-center text-black font-normal capitalize",
              row.original.status_bulky?.toLowerCase() === "selesai"
                ? "bg-green-400 hover:bg-green-400"
                : "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.status_bulky ?? "-"}
          </Badge>
        </div>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TooltipProviderPage value="View Detail">
            <Button
              asChild
              variant="outline"
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              <Link href={`/outbond/cargo-new/cargo/detail/${row.original.id}`}>
                <ReceiptText className="size-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const summaryCards = [
    {
      title: "Cargo Offline",
      type: "Offline",
      summary: offlineSummary,
      icon: Store,
      iconClass: "bg-purple-100 text-purple-700",
      borderClass: "border-purple-300",
    },
    {
      title: "Cargo Online",
      type: "Online",
      summary: onlineSummary,
      icon: ShoppingCart,
      iconClass: "bg-blue-100 text-blue-700",
      borderClass: "border-blue-300",
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
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Cargo</DialogTitle>
            <DialogDescription>
              Pilih type cargo dan isi nama cargo baru.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleCreateCargo}>
            <div className="flex flex-col gap-2">
              <Label>Type Cargo</Label>
              <Select
                value={cargoType}
                onValueChange={(value) => {
                  const type = value as CargoType;
                  setCargoType(type);
                  setCargoName("");
                  setCategoryId("");
                }}
                disabled={isPendingCreate}
              >
                <SelectTrigger className="border-sky-400/80 focus:ring-sky-400">
                  <SelectValue placeholder="Pilih type cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cargo offline">Offline</SelectItem>
                  <SelectItem value="cargo online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cargoType === "cargo online" ? (
              <div className="flex flex-col gap-2">
                <Label>Category Cargo</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => {
                    setCategoryId(value);
                    const selectedCategory = categoryOptions.find(
                      (option) => option.value === value,
                    );
                    setCargoName(selectedCategory?.label ?? "");
                  }}
                  disabled={
                    isPendingCreate || isPendingCategory || isRefetchingCategory
                  }
                >
                  <SelectTrigger className="border-sky-400/80 focus:ring-sky-400">
                    <SelectValue
                      placeholder={
                        isPendingCategory || isRefetchingCategory
                          ? "Loading category..."
                          : "Pilih category cargo"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="cargo-name">Nama Cargo</Label>
                <Input
                  id="cargo-name"
                  className="border-sky-400/80 focus-visible:ring-sky-400"
                  value={cargoName}
                  onChange={(e) => setCargoName(e.target.value)}
                  placeholder="Input nama cargo..."
                  disabled={isPendingCreate}
                  autoFocus
                />
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreate(false)}
                disabled={isPendingCreate}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="liquid"
                disabled={
                  isPendingCreate ||
                  !cargoName.trim() ||
                  (cargoType === "cargo online" && !categoryId)
                }
              >
                {isPendingCreate ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlusCircle className="size-4" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
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
          <BreadcrumbItem>Cargo</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full grid grid-cols-1 gap-4 lg:grid-cols-2">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const totalCargo = getSummaryValue(card.summary, [
            "total_cargo",
            "total_document",
            "qty",
          ]);
          const totalItem = getSummaryValue(card.summary, [
            "total_item",
            "total_product",
          ]);
          const totalOldPrice = getSummaryValue(card.summary, [
            "total_old_price",
          ]);

          return (
            <div
              key={card.type}
              className={cn(
                "rounded-md border bg-white p-5 shadow-sm",
                card.borderClass,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{card.type}</p>
                </div>
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-md",
                    card.iconClass,
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Package className="size-4" />
                    Total Cargo
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {totalCargo.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Package className="size-4" />
                    Total Item
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {totalItem.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <WalletCards className="size-4" />
                    Harga Asal
                  </div>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {formatRupiah(totalOldPrice)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-5 flex-col">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold">List Cargo</h2>
          <Button variant="liquid" onClick={() => setOpenCreate(true)}>
            <PlusCircle className="size-4" />
            Add Cargo
          </Button>
        </div>

        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 w-full lg:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search cargo..."
                />
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

            <div className="w-full lg:w-44">
              <Select
                value={filterType || "all"}
                onValueChange={(value) => {
                  setPage(1);
                  setFilterType(value === "all" ? "" : value);
                }}
              >
                <SelectTrigger className="border-sky-400/80 focus:ring-sky-400">
                  <Filter className="size-4" />
                  <SelectValue placeholder="Filter Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="cargo offline">Offline</SelectItem>
                  <SelectItem value="cargo online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DataTable
            columns={columnCargo}
            data={dataList}
            isLoading={loading}
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
