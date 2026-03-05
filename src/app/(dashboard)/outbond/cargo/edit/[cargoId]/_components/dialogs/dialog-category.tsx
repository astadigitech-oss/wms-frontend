"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { columnCategory, columnColor } from "../columns";

import { useSearchQuery } from "@/lib/search";
import { alertError, cn } from "@/lib/utils";

import { RefreshCw, X } from "lucide-react";
import { AxiosError } from "axios";

import { useEffect, useMemo, useState } from "react";

import { useGetListCategory } from "../../_api/use-get-list-category";
import { useGetListColor } from "../../_api/use-get-list-color";

export const DialogCategory = ({
  open,
  onOpenChange,
  onSelectCategory,
}: {
  open: boolean;
  onOpenChange: () => void;
  onSelectCategory: (data: {
    category?: any;
    color_name?: string;
    type: "category" | "color";
  }) => void;
}) => {
  const { search, searchValue, setSearch } = useSearchQuery("searchCategory");

  const [type, setType] = useState<"category" | "color">("category");

  /*
  ==========================
  CATEGORY API
  ==========================
  */

  const {
    data: dataCategory,
    isPending,
    refetch,
    isRefetching,
    error,
    isError,
  } = useGetListCategory({
    q: searchValue,
  });

  /*
  ==========================
  COLOR API
  ==========================
  */

  const {
    data: dataColor,
    isPending: isPendingColor,
    refetch: refetchColor,
  } = useGetListColor({
    q: searchValue,
  });

  /*
  ==========================
  DATA
  ==========================
  */

  const listCategory = useMemo(() => {
    return dataCategory?.data?.data?.resource ?? [];
  }, [dataCategory]);

  const listColor = useMemo(() => {
    return dataColor?.data?.data?.resource ?? [];
  }, [dataColor]);

  const isLoadingCategory = isPending || isRefetching;
  const isLoadingColor = isPendingColor;

  /*
  ==========================
  SELECT CATEGORY
  ==========================
  */

  const handleSelectCategory = (category: any) => {
    onSelectCategory({
      category,
      type: "category",
    });

    onOpenChange();
  };

  /*
  ==========================
  SELECT COLOR
  ==========================
  */

  const handleSelectColor = (color: any) => {
    onSelectCategory({
      color_name: color.id,
      type: "color",
    });

    onOpenChange();
  };

  /*
  ==========================
  ERROR HANDLING
  ==========================
  */

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Category",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  /*
  ==========================
  AUTO REFETCH WHEN TYPE CHANGE
  ==========================
  */

  useEffect(() => {
    if (!open) return;

    if (type === "category") {
      refetch();
    }

    if (type === "color") {
      refetchColor();
    }
  }, [type, open]);

  /*
  ==========================
  AUTO REFETCH WHEN SEARCH CHANGE
  ==========================
  */

  useEffect(() => {
    if (!open) return;

    if (type === "category") {
      refetch();
    } else {
      refetchColor();
    }
  }, [searchValue]);

  /*
  ==========================
  RESET STATE
  ==========================
  */

  useEffect(() => {
    if (!open) {
      setSearch("");
      setType("category");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">

        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">

            Select Type

            <TooltipProviderPage value="close">
              <button
                onClick={onOpenChange}
                className="w-6 h-6 flex items-center justify-center border rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>

          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          {/* TYPE SELECTOR */}

          <div className="flex gap-2">

            <Button
              variant={type === "category" ? "liquid" : "outline"}
              onClick={() => setType("category")}
            >
              Category
            </Button>

            <Button
              variant={type === "color" ? "liquid" : "outline"}
              onClick={() => setType("color")}
            >
              Color
            </Button>

          </div>

          {/* SEARCH */}

          <div className="flex gap-2">

            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />

            <TooltipProviderPage value="Reload Data">
              <Button
                onClick={() =>
                  type === "category"
                    ? refetch()
                    : refetchColor()
                }
                variant="outline"
                size="icon"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    (isLoadingCategory || isLoadingColor) &&
                      "animate-spin"
                  )}
                />
              </Button>
            </TooltipProviderPage>

          </div>

          {/* TABLE CATEGORY */}

          {type === "category" && (
            <DataTable
              isSticky
              maxHeight="h-[60vh]"
              isLoading={isLoadingCategory}
              columns={columnCategory({
                onSelectCategory: handleSelectCategory,
              })}
              data={listCategory}
            />
          )}

          {/* TABLE COLOR */}

          {type === "color" && (
            <DataTable
              isSticky
              maxHeight="h-[60vh]"
              isLoading={isLoadingColor}
              columns={columnColor({
                onSelectColor: handleSelectColor,
              })}
              data={listColor}
            />
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
};