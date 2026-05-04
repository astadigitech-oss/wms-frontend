"use client";

import { useEffect, useMemo, useState } from "react";
import { alertError } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { usePagination } from "@/lib/pagination";
import { useSearch } from "@/lib/search";
import { InputSearch } from "@/components/input-search";
import { FileDown, Loader2, ChevronDown, XCircle, CalendarIcon } from "lucide-react";

import { useExportHistoryRackStaging } from "../_api/use-export-rack-history-staging";
import { columnHistoryBundle } from "./columns";

/* DATE PICKER */
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetListHistoryBundling } from "../_api/use-get-list-history-rack-staging";
import { useParams } from "next/navigation";

export const Client = () => {
  const { skuId, skuMonth, skuYear } = useParams();
  const codeDocument = `${skuId}/${skuMonth}/${skuYear}`;
  const { page, metaPage, setPage, setPagination } = usePagination("pFilter");

  const { search, searchValue, setSearch } = useSearch();
  /* ================= DATE STATE ================= */
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [isOpen, setIsOpen] = useState(false);

  // /* ================= PARAMS ================= */
  // const params = useMemo(() => {
  //   return {
  //     p: page,
  //     q: searchValue,
  //     from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
  //     to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
  //   };
  // }, [page, searchValue, date]);

  /* ================= API ================= */
  const {
    data,
    refetch,
    error,
    isSuccess,
    isError,
    isRefetching,
    isPending,
    isLoading: isLoadingRack,
  } = useGetListHistoryBundling({
    code_documents: codeDocument,
    p: page,
    q: searchValue,
  });

  const dataListHistoryRack: any[] = useMemo(() => {
    return data?.data.data?.resource.data;
  }, [data]);

  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportHistoryRackStaging({
      start_date: date?.from ? format(date.from, "yyyy-MM-dd") : "",
      end_date: date?.to ? format(date.to, "yyyy-MM-dd") : "",
    });

  const isLoading =
    isPendingExport || isRefetching || isPending || isLoadingRack;

  /* ================= PAGINATION ================= */
  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data?.data?.resource);
    }
  }, [data, isSuccess]);

  /* RESET PAGE SAAT FILTER BERUBAH */
  useEffect(() => {
    setPage(1);
  }, [date]);

  /* AUTO REFETCH */
  useEffect(() => {
    refetch();
  }, [date]);

  /* ================= EXPORT ================= */
  // const handleExport = async () => {
  //   mutateExport(
  //     {
  //       searchParams: {
  //         from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
  //         to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
  //       },
  //     },
  //     {
  //       onSuccess: (res) => {
  //         const link = document.createElement("a");
  //         link.href = res.data.data.resource.download_url;
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       },
  //     }
  //   );
  // };
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

  /* ================= CLEAR DATE ================= */
  const clearRange = (e: any) => {
    e.preventDefault();
    setDate({ from: undefined, to: undefined });
  };

  /* ================= ERROR ================= */
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  /* ================= MOUNT ================= */
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <Loading />;

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full p-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full px-4 py-4">
      <div className="flex flex-col gap-4 w-full">
        {/* ================= BREADCRUMB ================= */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventory</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/product/sku">
                Product SKU
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/inventory/product/sku/${codeDocument}/detail`}
              >
                Detail
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>History</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ================= CONTENT ================= */}
        <div className="flex w-full bg-white rounded-md shadow px-5 py-3 gap-4 flex-col">
          <h3 className="text-lg font-semibold">List History SKU</h3>

          {/* ================= FILTER ================= */}
          <div className="flex items-center gap-2 w-full">
            {/* SEARCH */}
            <InputSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari history rack..."
              onClick={() => refetch()}
              loading={isRefetching}
              disabled={isPending}
            />

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-3 ml-auto">
              {/* DATE PICKER */}
              <div className="flex items-center gap-3 px-3 h-10 border rounded text-sm border-gray-500 min-w-[240px] w-[260px] justify-between">
                {" "}
                {/* DATE TEXT */}
                <p>
                  {(date?.from && format(date.from, "dd MMM yyyy")) ?? "Start"}{" "}
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
                        {(date?.from && format(date.from, "MMMM dd, yyyy")) ??
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
          </div>

          {/* ================= TABLE ================= */}
          <DataTable
            isSticky
            columns={columnHistoryBundle({
              metaPageHistoryBundling: metaPage,
              isLoading,
            })}
            data={dataListHistoryRack ?? []}
          />

          {/* ================= PAGINATION ================= */}
          <Pagination
            pagination={{
              ...metaPage,
              current: page,
            }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
