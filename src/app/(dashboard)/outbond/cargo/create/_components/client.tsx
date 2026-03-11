"use client";

import {
  SaveIcon,
  PercentCircle,
  Box,
  BadgeDollarSign,
  DollarSign,
  ArrowLeft,
  ScanText,
  Store,
  ShoppingCart,
} from "lucide-react";

import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

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

import { DialogDiscount, DialogName } from "./dialogs";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateCargo } from "../_api";

const initialValue = {
  buyer_id: "",
  name_buyer: "",
  discount_bulky: "0",
  category_bulky: "",
  total_old_price_bulky: "0",
  after_price_bulky: "0",
  total_product_bulky: "0",
  name_document: "",
  type_bulky: "cargo offline",
  name_category: "",
  category_id: 0,
};

export const Client = () => {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );

  const [input, setInput] = useState(initialValue);

  const { mutate: createCargo } = useCreateCargo();

  const handleCreateCargo = async () => {
    createCargo(
      {
        body: {
          buyer_id: input.buyer_id,
          discount_bulky: input.discount_bulky,
          name_document: input.name_document,
          type: input.type_bulky,
          category_id: input.category_id,
        },
      },
      {
        onSuccess: (data) => {
          router.push(`/outbond/cargo/edit/${data?.data?.data?.resource?.id}`);
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
      
      {/* Dialog */}
      <DialogDiscount
        open={dialog === "discount"}
        onOpenChange={() => {
          if (dialog === "discount") setDialog("");
        }}
        data={input}
        setData={setInput}
      />

      <DialogName
        open={dialog === "name"}
        onOpenChange={() => {
          if (dialog === "name") setDialog("");
        }}
        data={input}
        setData={setInput}
      />

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>Outbond</BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/cargo">Cargo</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">

          {/* Header */}
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/outbond/cargo">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>

            <h1 className="text-2xl font-semibold">Create Cargo</h1>
          </div>

          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between flex-wrap">

              <div className="flex items-center gap-4">

                {/* TYPE */}
                <div className="flex items-center border border-sky-400/80 rounded-md px-3 h-10 bg-white">
                  {input.type_bulky === "cargo online" ? (
                    <ShoppingCart  className="w-4 h-4 mr-2 text-sky-500" />
                  ) : (
                    <Store className="w-4 h-4 mr-2 text-sky-500" />
                  )}

                  <select
                    value={input.type_bulky}
                    onChange={(e) => {
                      const type = e.target.value;

                      setInput((prev) => ({
                        ...prev,
                        type_bulky: type,
                        discount_bulky:
                          type === "cargo offline"
                            ? "0"
                            : prev.discount_bulky,
                      }));
                    }}
                    className="bg-transparent outline-none text-sm cursor-pointer"
                  >
                    <option value="cargo offline">Offline</option>
                    <option value="cargo online">Online</option>
                  </select>
                </div>

                {/* NAME */}
                <TooltipProviderPage value={input.name_document}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50"
                    onClick={() => setDialog("name")}
                  >
                    <ScanText />

                    <Separator
                      orientation="vertical"
                      className="bg-gray-500"
                    />

                    <p className="min-w-5 max-w-52 truncate">
                      {input.name_document ? input.name_document : "-"}
                    </p>
                  </Button>
                </TooltipProviderPage>

                {/* DISCOUNT (ONLINE ONLY) */}
                {input.type_bulky === "cargo online" && (
                  <TooltipProviderPage
                    value={
                      <div className="flex flex-col max-w-72">
                        <p>Discount: {input.discount_bulky}%</p>
                      </div>
                    }
                  >
                    <Button
                      variant={"outline"}
                      className="border-sky-400/80 hover:bg-sky-50"
                      onClick={() => setDialog("discount")}
                    >
                      <PercentCircle />

                      <Separator
                        orientation="vertical"
                        className="bg-gray-500"
                      />

                      <p className="min-w-5">{input.discount_bulky}%</p>
                    </Button>
                  </TooltipProviderPage>
                )}
              </div>

              {/* SAVE */}
              <Button onClick={handleCreateCargo} variant={"liquid"}>
                <SaveIcon />
                Save
              </Button>
            </div>

            <Separator className="bg-sky-400/80" />

            {/* TOTAL INFO */}
            <div className="flex items-center gap-4">
              <TooltipProviderPage value={"Total Product"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80"
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
                  className="border-sky-400/80"
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
                  className="border-sky-400/80"
                  disabled
                >
                  <DollarSign />

                  <Separator orientation="vertical" className="bg-gray-500" />

                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.after_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};