"use client";

import {
  SaveIcon,
  Briefcase,
  PercentCircle,
  Box,
  BadgeDollarSign,
  DollarSign,
  ArrowLeft,
  ScanText,
  Blocks,
  Trash2,
  PlusIcon,
  Upload,
  Search,
  ArrowUpRightFromSquare,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import Loading from "@/app/(dashboard)/loading";
import { formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { DialogBuyer, DialogDiscount, DialogName } from "./dialogs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateCargo } from "../_api";
import { DialogCategory } from "./dialogs/dialog-category";
import { DataTable } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/lib/search";
import { columnProductCargo } from "./columns";

const initialValue = {
  buyer_id: "",
  name_buyer: "",
  discount_bulky: "0",
  category_bulky: "",
  total_old_price_bulky: "0",
  after_price_bulky: "0",
  total_product_bulky: "0",
  name_document: "",
  name_category: "",
  category_id: 0,
};

export const Client = () => {
  const router = useRouter();
    const searchRef = useRef<HTMLInputElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );
  const { search, setSearch } = useSearch();

  const [input, setInput] = useState(initialValue);
  const { mutate: createCargo } = useCreateCargo();

  const handleCreateCargo = async () => {
    createCargo(
      {
        body: {
          buyer_id: input.buyer_id,
          discount_bulky: input.discount_bulky,
          category_bulky: input.category_bulky,
          name_document: input.name_document,
        },
      },
      {
        onSuccess: (data) => {
          router.push(`/outbond/Cargo/edit/${data?.data?.data?.resource?.id}`);
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DialogCategory
        open={dialog === "category"}
        onOpenChange={() => {
          if (dialog === "category") {
            setDialog("");
          }
        }}
        setInput={setInput}
      />
      <DialogBuyer
        open={dialog === "buyer"}
        onOpenChange={() => {
          if (dialog === "buyer") {
            setDialog("");
          }
        }}
        setInput={setInput}
      />

      <DialogDiscount
        open={dialog === "discount"}
        onOpenChange={() => {
          if (dialog === "discount") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <DialogName
        open={dialog === "name"}
        onOpenChange={() => {
          if (dialog === "name") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/Cargo">Cargo</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/outbond/Cargo">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create Cargo</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-4">
                <TooltipProviderPage value={input.name_category}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("category")}
                  >
                    <Blocks />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="w-72 text-left truncate">
                      {input.category_id
                        ? input.name_category
                        : "Select Category"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={input.name_buyer}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("buyer")}
                  >
                    <Briefcase />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="w-72 text-left truncate">
                      {input.buyer_id ? input.name_buyer : "Select Buyer"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage
                  value={
                    <div className="flex flex-col max-w-72">
                      <p>Discount: {input.discount_bulky}%</p>
                    </div>
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("discount")}
                  >
                    <PercentCircle />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5">{input.discount_bulky}%</p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={input.name_document}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("name")}
                    // disabled={listData.length > 0}
                  >
                    <ScanText />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5 max-w-52 truncate">
                      {input.name_document ? input.name_document : "-"}
                    </p>
                  </Button>
                </TooltipProviderPage>
              </div>
              <Button onClick={handleCreateCargo} variant={"liquid"}>
                <SaveIcon />
                Save
              </Button>
            </div>
            <Separator className="bg-sky-400/80" />
            <div className="flex items-center gap-4">
              <TooltipProviderPage value={"Total Product"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <Box />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {parseFloat(input.total_product_bulky).toLocaleString()}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total all product price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <BadgeDollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.total_old_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total final price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <DollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.after_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
              <Button onClick={handleCreateCargo} variant={"liquid"}>
                <PlusIcon />
                Bag
              </Button>
              <Button onClick={handleCreateCargo} className="bg-red-500">
                <Trash2 />
                Delete Bag
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-b rounded-tr shadow flex flex-col gap-4">
          {/* {bagProduct == null ? (
            <div className="flex items-center justify-center w-full min-h-[60px]">
              <span className="text-sm text-gray-500">
                Silakan buat bag terlebih dahulu sebelum menambah produk.
              </span>
            </div>
          ) : (
            !isBagDone && ( */}
              <div className="flex items-center gap-4 w-full opacity-100">
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
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 flex-none"
                    size={"icon"}
                    // onClick={() => refetch()}
                  >
                    {/* <RefreshCcw className={Loding ? "animate-spin" : ""} /> */}
                  </Button>
                </TooltipProviderPage>
                <Button variant={"liquid"} onClick={() => setDialog("upload")}>
                  <Upload />
                  Import File
                </Button>
              </div>
            {/* ) */}
          {/* // )} */}
          <DataTable
            columns={columnProductCargo({
              // handleRemoveProduct,
              // isLoading: isPendingRemoveProduct,
            })}
            data={[]}
            // isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
