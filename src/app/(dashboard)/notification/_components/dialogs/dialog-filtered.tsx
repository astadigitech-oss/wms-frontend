import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

import { AxiosError } from "axios";
import React, { useEffect, useMemo } from "react";
import { alertError, cn } from "@/lib/utils";
import { Loader2, ShieldCheck, RefreshCw, X } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import Pagination from "@/components/pagination";
import { usePagination } from "@/lib/pagination";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { columnFilteredProduct } from "../columns";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useGetListFilterProductRedis } from "../../_api/use-get-list-filter-product-redis";
import { useDoneCheckProductRedis } from "../../_api/use-done-check-product-redis";

export const DialogFiltered = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  const [DoneCheckAllDialog, confirmDoneCheckAll] = useConfirm(
    "Check All Product",
    "This action cannot be undone",
    "liquid",
  );
  const { page, metaPage, setPage, setPagination } = usePagination("pFilter");
  const [dataSearch, setDataSearch] = useQueryState("qRedis", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);

  const { data, refetch, error, isError, isSuccess, isRefetching, isPending } =
    useGetListFilterProductRedis({
      p: page,
      q: searchValue,
    });
  const { mutate: mutateDoneCheckAll, isPending: isPendingDoneCheckAll } =
    useDoneCheckProductRedis();

  const isLoading = isPendingDoneCheckAll || isRefetching || isPending;

  const dataListFiltered: any = useMemo(() => {
    return data?.data?.data;
  }, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data);
    }
  }, [data, isSuccess]);

  const handleDoneCheckAll = async () => {
    const ok = await confirmDoneCheckAll();

    if (!ok) return;

    mutateDoneCheckAll({});
  };

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DoneCheckAllDialog />
      <SheetContent className="min-w-[75vw]">
        <SheetHeader>
          <SheetTitle>List Product (Filtered)</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="w-full flex flex-col gap-5 mt-5 text-sm">
          <div className="flex gap-4 items-center w-full">
            <div className="h-9 px-4 flex items-center rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
              Total Filtered:{" "}
              <span className="font-semibold">
                {dataListFiltered?.total} Products
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center w-full">
            <div className="w-2/5 flex items-center relative">
              <Input
                className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
              />
              {dataSearch && (
                <button
                  type="button"
                  onClick={() => setDataSearch("")}
                  className="absolute right-3"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleDoneCheckAll();
              }}
              type="button"
              className="bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingDoneCheckAll}
            >
              {isPendingDoneCheckAll ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Done Check All
            </Button>
          </div>
          <DataTable
            isSticky
            columns={columnFilteredProduct({
              metaPage,
              isLoading,
            })}
            data={dataListFiltered?.data ?? []}
          />
          <Pagination
            pagination={{
              ...metaPage,
              current: page,
            }}
            setPagination={setPage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
