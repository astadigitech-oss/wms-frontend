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
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";

import { useDoneCheckProductStaging } from "../_api/use-done-check-product-staging";
import { useRemoveFilterProductStaging } from "../_api/use-remove-filter-product-staging";
import { useGetListFilterProductStaging } from "../_api/use-get-list-filter-product-staging";

import { useConfirm } from "@/hooks/use-confirm";
import Pagination from "@/components/pagination";
import { usePagination } from "@/lib/pagination";
import { columnFilteredProductStaging } from "./columns";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

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
    "liquid"
  );
  const { mutate: mutateRemoveFilter, isPending: isPendingRemoveFilter } =
    useRemoveFilterProductStaging();
  const { mutate: mutateDoneCheckAll, isPending: isPendingDoneCheckAll } =
    useDoneCheckProductStaging();

  const { page, metaPage, setPage, setPagination } = usePagination("pFilter");

  const { data, refetch, error, isError, isSuccess, isRefetching, isPending } =
    useGetListFilterProductStaging({
      p: page,
    });

  const isLoading =
    isPendingDoneCheckAll || isPendingRemoveFilter || isRefetching || isPending;

  const dataListFiltered: any[] = useMemo(() => {
    return data?.data.data.resource.data.data;
  }, [data]);

  const dataPriceTotal: any = useMemo(() => {
    return data?.data.data.resource.total_new_price;
  }, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource.data);
    }
  }, [data, isSuccess]);

  const handleRemoveFilter = (id: any) => {
    mutateRemoveFilter({ id });
  };

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
          <SheetTitle>List Product Stagging (Filtered)</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="w-full flex flex-col gap-5 mt-5 text-sm">
          <div className="flex gap-4 items-center w-full">
            <div className="h-9 px-4 flex items-center rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
              Total Filtered:{" "}
              <span className="font-semibold">{metaPage.total} Products</span>
            </div>
            <div className="h-9 px-4 flex-none flex items-center text-sm rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
              Total Price:{" "}
              <span className="font-semibold">
                {formatRupiah(dataPriceTotal)}
              </span>
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
            columns={columnFilteredProductStaging({
              metaPage,
              isLoading,
              handleRemoveFilter,
            })}
            data={dataListFiltered ?? []}
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
