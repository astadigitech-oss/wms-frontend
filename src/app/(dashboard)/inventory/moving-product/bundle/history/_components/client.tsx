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
import {
  FileDown,
  Loader2,
  ChevronDown,
  XCircle,
} from "lucide-react";

import { useExportHistoryRackStaging } from "../_api/use-export-rack-history-staging";
import { columnHistoryRackColor } from "./columns";
import { useGetListHistoryRackColor } from "../_api/use-get-list-history-rack-staging";

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

export const Client = () => {
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportHistoryRackStaging();

  const { page, metaPage, setPage, setPagination } =
    usePagination("pFilter");

  const { search, searchValue, setSearch } = useSearch();

  /* ================= DATE STATE ================= */
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [isOpen, setIsOpen] = useState(false);

  /* ================= PARAMS ================= */
  const params = useMemo(() => {
    return {
      p: page,
      q: searchValue,
      from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
      to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
    };
  }, [page, searchValue, date]);

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
  } = useGetListHistoryRackColor(params);

  const isLoading =
    isPendingExport || isRefetching || isPending || isLoadingRack;

  const dataListHistoryRack: any[] = useMemo(() => {
    return data?.data.data?.resource.data;
  }, [data]);

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
              <BreadcrumbLink href="/inventory/moving-product/bundle">
                Bundle
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>History</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ================= CONTENT ================= */}
        <div className="flex w-full bg-white rounded-md shadow px-5 py-3 gap-4 flex-col">
          <h3 className="text-lg font-semibold">
            List History Bundle
          </h3>

          {/* ================= FILTER ================= */}
          <div className="flex gap-4 items-center w-full flex-wrap">
            {/* DATE PICKER */}
            <div className="px-3 h-10 py-1 border rounded flex gap-3 items-center text-sm border-gray-500">
              <p>
                {(date?.from && format(date.from, "dd MMM yyyy")) ?? "Start"} -{" "}
                {(date?.to && format(date.to, "dd MMM yyyy")) ?? "End"}
              </p>

              {(date?.from || date?.to) && (
                <button onClick={clearRange}>
                  <XCircle className="w-4 h-4 text-red-500" />
                </button>
              )}

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

            {/* SEARCH */}
            <InputSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari history rack..."
              onClick={() => refetch()}
              loading={isRefetching}
              disabled={isPending}
            />

            {/* EXPORT */}
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleExport();
              }}
              type="button"
              className="bg-sky-400/80 hover:bg-sky-400 text-black ml-auto"
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

          {/* ================= TABLE ================= */}
          <DataTable
            isSticky
            columns={columnHistoryRackColor({
              metaPage,
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