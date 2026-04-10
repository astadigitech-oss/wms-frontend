"use client";

import { Search, SaveIcon, ArrowLeft, ArrowUpRightFromSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { columnBKL, BKLProduct } from "./columns";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import { alertError } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useSearch } from "@/lib/search";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { AxiosError } from "axios";
import { DialogProduct } from "./dialogs/dialog-products";
import { parseAsString, useQueryState } from "nuqs";

const initialValue = {
  path_todo: "",
  no: "",
};

export const Client = () => {
  const searchRef = useRef<HTMLInputElement | null>(null);
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

  const [input, setInput] = useState(initialValue);
  const [products, setProducts] = useState<BKLProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { search, searchValue, setSearch } = useSearch();

  const handleAddProduct = (barcode: string) => {
    // Simulate adding product - in real implementation, this would call API
    if (!barcode) return;

    const newProduct: BKLProduct = {
      id: `${Date.now()}-${Math.random()}`,
      barcode: barcode,
      product_name: `Product ${products.length + 1}`,
      category: "Category",
      price: 0,
    };

    setProducts([...products, newProduct]);
    setSearch("");
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const handleRemoveProduct = async (id: string) => {
    const ok = await confirmRemove();
    if (!ok) return;

    setProducts(products.filter((p) => p.id !== id));
  };

  const handleCreateBKL = async () => {
    if (!input.path_todo || !input.no) {
      alertError({
        isError: true,
        error: new AxiosError("Please fill all fields"),
        data: "BKL Form",
        action: "validate",
        method: "POST",
      });
      return;
    }

    if (products.length === 0) {
      alertError({
        isError: true,
        error: new AxiosError("Please add at least one product"),
        data: "BKL Form",
        action: "validate",
        method: "POST",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to create BKL
      // const response = await createBKLAPI({
      //   path_todo: input.path_todo,
      //   no: input.no,
      //   products: products,
      // });

      console.log({
        path_todo: input.path_todo,
        no: input.no,
        products: products,
      });

      setTimeout(() => {
        setInput(initialValue);
        setProducts([]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      alertError({
        isError: true,
        error: error as AxiosError,
        data: "BKL",
        action: "create",
        method: "POST",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchValue) {
      handleAddProduct(searchValue);
    }
  }, [searchValue]);

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
            <h1 className="text-2xl font-semibold">Create BKL</h1>
          </div>

          {/* Form Inputs */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-64">
                <div className="flex flex-col gap-2 flex-1">
                  
                  <Input
                    placeholder="Pilih Toko"
                    value={input.path_todo}
                    onChange={(e) =>
                      setInput({ ...input, path_todo: e.target.value })
                    }
                    className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-1 min-w-48">
                <div className="flex flex-col gap-2 flex-1">
                  
                  <Input
                    placeholder="Rp. 0"
                    value={input.no}
                    onChange={(e) => setInput({ ...input, no: e.target.value })}
                    className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateBKL}
                variant="liquid"
                className="self-end"
                disabled={isLoading}
              >
                <SaveIcon className={isLoading ? "animate-spin" : ""} />
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Products Table Section */}
        <div className="p-4 bg-white rounded-b rounded-tr shadow flex flex-col gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center w-full">
              <TooltipProviderPage value={"Add Product"}>
                <div className="relative flex w-full items-center">
                  <Search className="absolute size-4 ml-3" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0 border-r-0 rounded-r-none pl-10 disabled:opacity-100"
                  />
                </div>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Open List Products"}>
                <Button
                  size={"icon"}
                  variant={"liquid"}
                  className="rounded-l-none"
                  onClick={() => setDialog("product")}
                >
                  <ArrowUpRightFromSquare />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>

          <DataTable
            columns={columnBKL({
              handleRemoveProduct,
              isLoading: false,
            })}
            data={products}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
