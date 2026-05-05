"use client";

import {
  CalendarIcon,
  ChevronDown,
  FileDown,
  Loader2,
  PackageOpen,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListBundle } from "../_api/use-get-list-bundle";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { useUnbundleBundle } from "../_api/use-unbundle-bundle";
import { useConfirm } from "@/hooks/use-confirm";
import { useExportBundle } from "../_api/use-export-bundle";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";

export const Client = () => {
  // data search, page
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [isOpen, setIsOpen] = useState(false);

  const [UnbundleDialog, confirmUnbundle] = useConfirm(
    "Unbundle Bundle",
    "This action cannot be undone",
    "destructive",
  );

  const { mutate: mutateUnbundle, isPending: isPendingUnbundle } =
    useUnbundleBundle();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportBundle();

  // get data utama
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListBundle({ p: page, q: searchValue });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource,
      setPage,
      setMetaPage,
    });
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handleUnbundle = async (id: any) => {
    const ok = await confirmUnbundle();

    if (!ok) return;

    mutateUnbundle({ id });
  };

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource.download_url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  // column data
  const columnListBundle: ColumnDef<any>[] = [
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
      accessorKey: "barcode_bundle",
      header: "Barcode",
    },
    {
      accessorKey: "name_bundle",
      header: "Bundle Name",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">
          {row.original.name_bundle}
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">{row.original.user}</div>
      ),
    },
    {
      accessorKey: "total_product_bundle",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.total_product_bundle.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_price_custom_bundle",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.total_price_custom_bundle),
    },
    // {
    //   accessorKey: "product_status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const status = row.original.product_status?.toLowerCase();

    //     return (
    //       <Badge
    //         className={`rounded text-black font-normal capitalize hover:opacity-90 ${
    //           status === "sale"
    //             ? "bg-green-400/80 hover:bg-green-400/80"
    //             : "bg-gray-200 hover:bg-gray-200"
    //         }`}
    //       >
    //         {row.original.product_status}
    //       </Badge>
    //     );
    //   },
    // },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              asChild
            >
              <Link
                href={`/inventory/moving-product/bundle/detail/${row.original.id}`}
              >
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Unbundle</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              type="button"
              disabled={isPendingUnbundle}
              onClick={(e) => {
                e.preventDefault();
                handleUnbundle(row.original.id);
              }}
            >
              {isPendingUnbundle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PackageOpen className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const clearRange = (e: any) => {
    e.preventDefault();
    setDate({ from: undefined, to: undefined });
  };

  // loading
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
      <UnbundleDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Moving Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Bundle</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Bundle</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
              />
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
              <div className="flex gap-4 items-center ml-auto">
                {/* RIGHT SECTION */}
                <div className="flex items-center gap-3 ml-auto">
                  {/* DATE PICKER */}
                  <div className="flex items-center gap-3 px-3 h-10 border rounded text-sm border-gray-500 min-w-[240px] w-[260px] justify-between">
                    {" "}
                    {/* DATE TEXT */}
                    <p>
                      {(date?.from && format(date.from, "dd MMM yyyy")) ??
                        "Start"}{" "}
                      - {(date?.to && format(date.to, "dd MMM yyyy")) ?? "End"}
                    </p>
                    {/* CLEAR BUTTON */}
                    {(date?.from || date?.to) && (
                      <button onClick={clearRange}>
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                    {/* DIALOG */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DialogTrigger>

                      <DialogContent className="w-auto max-w-5xl p-3">
                        <DialogHeader>
                          <DialogTitle>Pick Date Range</DialogTitle>
                        </DialogHeader>

                        {/* QUICK SELECT */}
                        <div className="flex gap-2 mb-2">
                          <div className="w-full items-center flex justify-start px-3 border border-sky-400/80 rounded h-9">
                            <CalendarIcon className="size-4 mr-2" />
                            {(date?.from &&
                              format(date.from, "MMMM dd, yyyy")) ??
                              "Pick a date"}{" "}
                            -{" "}
                            {(date?.to && format(date.to, "MMMM dd, yyyy")) ??
                              "Pick a date"}
                          </div>
                          <Popover open={isOpen} onOpenChange={setIsOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <ChevronDown className="size-4" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="p-0 w-fit">
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => {
                                        setDate({
                                          from: subDays(new Date(), 7),
                                          to: new Date(),
                                        });
                                        setIsOpen(false);
                                      }}
                                    >
                                      Last Week
                                    </CommandItem>

                                    <CommandItem
                                      onSelect={() => {
                                        setDate({
                                          from: subDays(new Date(), 30),
                                          to: new Date(),
                                        });
                                        setIsOpen(false);
                                      }}
                                    >
                                      Last Month
                                    </CommandItem>

                                    <CommandItem
                                      onSelect={() => {
                                        setDate({
                                          from: subDays(new Date(), 90),
                                          to: new Date(),
                                        });
                                        setIsOpen(false);
                                      }}
                                    >
                                      3 Months
                                    </CommandItem>
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* CALENDAR */}
                        <div className="border rounded p-2">
                          <Calendar
                            mode="range"
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {/* EXPORT */}
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport();
                    }}
                    type="button"
                    className="bg-sky-400/80 hover:bg-sky-400 text-black"
                    disabled={isPendingExport}
                  >
                    {isPendingExport ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4 mr-2" />
                    )}
                    Export
                  </Button>
                </div>
                <Button
                  asChild
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/inventory/moving-product/bundle/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    Add Bundle
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnListBundle} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
