"use client";

import {
  SaveIcon,
  ArrowLeft,
  Loader2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { columnBKL } from "./columns";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { DialogProduct } from "./dialogs/dialog-products";
import { parseAsString, useQueryState } from "nuqs";
import { useParams } from "next/navigation";
import { useGetDetailBKL } from "../_api/use-get-detail-bkl";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useSubmitBKL } from "../_api/use-submit";
import Link from "next/link";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { cn } from "@/lib/utils";
export const Client = () => {
  const { BKLId } = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Delete Product BKL",
    "This action cannot be undone",
    "destructive",
  );

  const {
    data: detailBKL,
    refetch: refetchBKL,
    isRefetching: isRefetchingBKL,
    isLoading: isLoadingBKL,
  } = useGetDetailBKL({
    id: BKLId,
  });

  const dataDetailBKL: any = useMemo(() => {
    return detailBKL?.data.data.resource;
  }, [detailBKL]);
  const isDone = dataDetailBKL?.status === "done";

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();
  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();
  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmitBKL();

  const [input, setInput] = useState({
    barcode: "",
  });
  const handleAddProduct = () => {
    const body = {
      barcode: input.barcode,
      bkl_document_id: BKLId,
    };
    mutateAddProduct(body, {
      onSuccess: () => {
        setInput((prev) => ({ ...prev, barcode: "" }));
      },
    });
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmRemove();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleSubmit = async () => {
    mutateSubmit(BKLId as string);
  };
  // useEffect(() => {
  //   if (searchValue) {
  //     handleAddProduct(searchValue);
  //   }
  // }, [searchValue]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RemoveDialog />
      <DialogProduct
        open={dialog === "product"}
        onOpenChange={() => {
          if (dialog === "product") {
            setDialog("");
          }
        }}
        // cargoId={cargoId}
        // isPendingAddProduct={isPendingAddProduct}
        handleAddProduct={handleAddProduct}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/slow-moving-product/bkl">
              BKL
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full relative flex flex-col gap-4">
        {/* Header Section */}
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/inventory/slow-moving-product/bkl">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">
              {dataDetailBKL?.code_document_bkl || ""}
            </h1>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-64">
                <div className="flex flex-col gap-2 flex-1">
                  <Input
                    disabled
                    placeholder="Pilih Toko"
                    value={dataDetailBKL?.destination_name || ""}
                    className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-1 min-w-48">
                <div className="flex flex-col gap-2 flex-1">
                  <Input
                    disabled
                    placeholder="Rp. 0"
                    value={dataDetailBKL?.total_price || ""}
                    className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                variant="liquid"
                className="self-end"
                disabled={isLoadingBKL || isPendingSubmit || isDone}
              >
                <SaveIcon />
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Products Table Section */}
        <div className="p-4 bg-white rounded-b rounded-tr shadow flex flex-col gap-4">
          <div className="flex w-full items-center gap-3">
            <Input
              value={input.barcode}
              onChange={(e) => {
                setInput((prev) => ({
                  ...prev,
                  barcode: e.target.value,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.barcode.trim()) {
                  handleAddProduct();
                }
              }}
              className="w-full border-sky-400/80 focus-visible:ring-sky-400"
              placeholder="Scan barcode..."
              autoFocus
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleAddProduct();
              }}
              className="items-center flex-none border-sky-400 bg-sky-400 hover:bg-sky-300 text-white h-10"
              disabled={!input.barcode || isPendingAddProduct || isDone}
            >
              {isPendingAddProduct ? (
                <>
                  <Loader2 className="size-3 mr-1 animate-spin" />
                </>
              ) : (
                <>
                  <PlusCircle className="size-4 mr-1" />
                </>
              )}
              Add
            </Button>
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetchBKL()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    isRefetchingBKL ? "animate-spin" : "",
                  )}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <DataTable
            columns={columnBKL({
              handleRemoveProduct,
              isLoading: false,
              isPendingRemoveProduct,
            })}
            data={dataDetailBKL?.scanned_products || []}
            isLoading={isLoadingBKL || isRefetchingBKL}
          />
        </div>
      </div>
    </div>
  );
};
