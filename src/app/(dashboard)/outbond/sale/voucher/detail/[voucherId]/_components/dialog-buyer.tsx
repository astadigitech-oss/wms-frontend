"use client";

import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { CalendarIcon, CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { alertError, cn } from "@/lib/utils";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import { useGetListBuyer } from "../_api/use-get-list-buyer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const columnsBuyer = ({
  metaPage,
  onSelect,
  isPending,
  startDate,
}: {
  metaPage: any;
  onSelect: (buyer: any, startDate: Date) => void;
  isPending: boolean;
  startDate?: Date;
}): ColumnDef<any>[] => [
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
    accessorKey: "name_buyer",
    header: "Buyer Name",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.name_buyer}</div>
    ),
  },
  {
    accessorKey: "phone_buyer",
    header: "No. Hp",
  },
  {
    accessorKey: "address_buyer",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.address_buyer}</div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <TooltipProviderPage value="Select">
          <Button
            className="items-center p-0 w-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
            disabled={isPending || !startDate}
            variant="outline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (!startDate) return;
              onSelect(row.original, startDate);
            }}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </Button>
        </TooltipProviderPage>
      </div>
    ),
  },
];

export const DialogBuyer = ({
  open,
  onOpenChange,
  onSelect,
  isPending,
}: {
  open: boolean;
  onOpenChange: () => void;
  onSelect: (buyer: any, startDate: Date) => void;
  isPending: boolean;
}) => {
  const { search, searchValue, setSearch } = useSearchQuery("searchBuyer");
  const { metaPage, page, setPage, setPagination } = usePagination("pageBuyer");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isOpenDate, setIsOpenDate] = useState(false);

  const { data, isPending: isPendingBuyer, refetch, isRefetching, error, isError, isSuccess } =
    useGetListBuyer({
      p: page,
      q: searchValue,
    });

  const listData = useMemo(() => {
    const resource = data?.data?.data?.resource;

    if (Array.isArray(resource)) return resource;
    return resource?.data ?? [];
  }, [data]);

  const isLoading = isPendingBuyer || isRefetching;

  useEffect(() => {
    const resource = data?.data?.data?.resource;

    if (data && isSuccess && !Array.isArray(resource)) {
      setPagination(resource);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Buyer",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setSearch("");
      setStartDate(undefined);
      setIsOpenDate(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Select Buyer
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
            />
            <TooltipProviderPage value="Reload Data">
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoading ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
            <Popover open={isOpenDate} onOpenChange={setIsOpenDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "ml-auto justify-start border-sky-400/80 text-left font-normal hover:bg-sky-50",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="size-4 mr-2" />
                  {startDate
                    ? format(startDate, "MMMM dd, yyyy")
                    : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[60]" align="end">
                <Calendar
                  initialFocus
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsOpenDate(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DataTable
            isSticky
            maxHeight="h-[60vh]"
            isLoading={isLoading}
            columns={columnsBuyer({
              metaPage,
              onSelect,
              isPending,
              startDate,
            })}
            data={listData ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBuyer;
