"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
import {
  parseAsBoolean,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import BarcodePrinted from "@/components/barcode";
import { useGetPriceProductPA } from "../_api/use-get-price-product-pa";
import { useSubmitManualInbound } from "../_api/use-submit-manual-inbound";
import Loading from "@/app/(dashboard)/loading";
import { Checkbox } from "@/components/ui/checkbox";

export const Client = () => {
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [barcodeOpen, setBarcodeOpen] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );
  const [
    { barcode, newPrice, newName, oldPrice, category, discount },
    setMetaBarcode,
  ] = useQueryStates(
    {
      barcode: parseAsString.withDefault(""),
      newPrice: parseAsString.withDefault(""),
      newName: parseAsString.withDefault(""),
      oldPrice: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      discount: parseAsString.withDefault(""),
    },
    {
      urlKeys: {
        newName: "new-name",
        newPrice: "new-price",
        oldPrice: "old-price",
      },
    },
  );

  const [input, setInput] = useState({
    name: "",
    price: "0",
    qty: "0",
    discountPrice: "0",
    category: "",
    discount: 0,
    damaged: "",
    abnormal: "",
    isExtra: false,
  });

  // debounce
  const priceValue = useDebounce(input.price);

  const { mutate } = useSubmitManualInbound();

  const {
    data: dataPrice,
    isLoading: isLoadingPrice,
    isSuccess: isSuccessPrice,
  } = useGetPriceProductPA({
    price: priceValue,
  });

  const categories: any[] = useMemo(() => {
    return dataPrice?.data.data.resource.category ?? [];
  }, [dataPrice]);

  const colorData: any = useMemo(() => {
    return {
      fixed_price_color:
        dataPrice?.data.data.resource?.warna?.fixed_price_color ?? "0",
      hexa_code_color:
        dataPrice?.data.data.resource?.warna?.hexa_code_color ?? "",
      name_color: dataPrice?.data.data.resource?.warna?.name_color ?? "",
    };
  }, [dataPrice]);

  const handleSubmit = (e: FormEvent, type: string) => {
    e.preventDefault();

    const body = {
      new_name_product: input.name,
      new_quantity_product: input.qty,
      old_price_product: input.price,
      new_status_product: "display",
      new_category_product: type === "lolos" ? (input.category ?? "") : "",
      new_price_product: input.discountPrice,
      new_tag_product: colorData.name_color ?? "",
      condition: type,
      is_extra: input.isExtra,
      description:
        type === "abnormal"
          ? input.abnormal
          : type === "damaged"
            ? input.damaged
            : "",
    };

    mutate(body, {
      onSuccess: (data) => {
        setInput({
          name: "",
          price: "0",
          qty: "0",
          discountPrice: "0",
          category: "",
          discount: 0,
          damaged: "",
          abnormal: "",
          isExtra: false,
        });
        if (nameRef.current) {
          nameRef.current.focus();
        }
        if (data.data.data.resource?.new_category_product) {
          setBarcodeOpen(true);
          setMetaBarcode({
            barcode: data.data.data.resource.new_barcode_product,
            newPrice: data.data.data.resource.new_price_product,
            newName: data.data.data.resource.new_name_product,
            oldPrice: data.data.data.resource.old_price_product,
            category: data.data.data.resource.new_category_product,
            discount: data.data.data.resource.discount_category,
          });
        }
      },
    });
  };

  useEffect(() => {
    if (
      isSuccessPrice &&
      dataPrice &&
      !dataPrice?.data.data.resource.category
    ) {
      setInput((prev) => ({
        ...prev,
        category: "",
        discount: 0,
      }));
    }
  }, [dataPrice]);

  useEffect(() => {
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(input.price))) {
      setInput((prev) => ({ ...prev, price: "0" }));
    }
    if (isNaN(parseFloat(input.discountPrice))) {
      setInput((prev) => ({ ...prev, discountPrice: "0" }));
    }
  }, [input]);

  // effect count discount
  useEffect(() => {
    if (parseFloat(input.price) < 100000) {
      setInput((prev) => ({
        ...prev,
        discountPrice: Math.round(
          parseFloat(colorData.fixed_price_color),
        ).toString(),
      }));
    } else {
      setInput((prev) => ({
        ...prev,
        discountPrice: (
          Math.round(parseFloat(input.price)) -
          (Math.round(parseFloat(input.price)) / 100) * input.discount
        ).toString(),
      }));
    }
  }, [input.price, colorData.fixed_price_color, input.discount]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Data Check</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Manual Inbound</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full gap-4">
        <div className="w-3/4">
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
            <h2 className="text-xl font-bold">Add New Data</h2>
            <div className="flex w-full items-center gap-4 flex-col">
              <div className="flex flex-col w-full gap-1">
                <Label>Product Name</Label>
                <Input
                  value={input.name}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                  autoFocus
                  ref={nameRef}
                />
              </div>
              <div className="flex w-full gap-4">
                <div className="flex flex-col w-full gap-1">
                  <Label>Price</Label>
                  <Input
                    value={input.price}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        price: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                    type="number"
                    className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                  />
                </div>
                <div className="flex flex-col w-full gap-1">
                  <Label>Qty</Label>
                  <Input
                    value={input.qty}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        qty: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                    type="number"
                    className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Checkbox
                    id="is_extra"
                    checked={input.isExtra}
                    onCheckedChange={(checked) =>
                      setInput((prev) => ({
                        ...prev,
                        isExtra: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="is_extra">Extra Product</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/4">
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
            <h2 className="text-xl font-bold">Price After Discount</h2>
            <div className="flex w-full items-center gap-4 flex-col mt-4">
              <Input
                value={input.discountPrice}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    discountPrice: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
                type="number"
                className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                disabled
              />
            </div>
            <p className="flex w-full items-center justify-center mt-4 mb-2 font-semibold">
              {formatRupiah(parseFloat(input.discountPrice)) ?? "Rp. 0"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center">
        <Tabs defaultValue="good" className="w-full">
          <div className="w-full flex justify-center">
            <TabsList className="bg-sky-100">
              <TabsTrigger className="w-32" value="good">
                Good
              </TabsTrigger>
              <TabsTrigger className="w-32" value="damaged">
                Damaged
              </TabsTrigger>
              <TabsTrigger className="w-32" value="abnormal">
                Abnormal
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="good">
            <form
              onSubmit={(e) => handleSubmit(e, "lolos")}
              className="w-full space-y-6 mt-6"
            >
              {isLoadingPrice ? (
                <div className="flex w-full bg-white rounded-md shadow items-center justify-center h-[200px]">
                  <Loader className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="w-full">
                  {parseFloat(input.price) >= 100000 &&
                    categories.length !== 1 && (
                      <div className="w-full flex flex-col gap-3">
                        <RadioGroup
                          onValueChange={(e) => {
                            const selectedCategory = categories.find(
                              (item) => item.name_category === e,
                            );
                            setInput((prev) => ({
                              ...prev,
                              category: selectedCategory?.name_category ?? "",
                              discount: parseFloat(
                                selectedCategory?.discount_category ?? "0",
                              ),
                            }));
                          }}
                          className="grid grid-cols-4 w-full gap-6"
                        >
                          {categories.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center gap-4 w-full border px-4 py-2.5 rounded-md",
                                input.category === item.name_category
                                  ? "border-gray-500 bg-sky-100"
                                  : "border-gray-300",
                              )}
                            >
                              <RadioGroupItem
                                value={item.name_category}
                                checked={item.name_category === input.category}
                                id={item.id}
                                className="flex-none"
                              />
                              <Label
                                htmlFor={item.id}
                                className="flex flex-col gap-1.5 w-full"
                              >
                                <p
                                  className={cn(
                                    "font-bold border-b pb-1.5",
                                    input.category === item.name_category
                                      ? "border-gray-500"
                                      : "border-gray-300",
                                  )}
                                >
                                  {item.name_category}
                                </p>
                                <p className="text-xs font-light flex items-center gap-1">
                                  <span>{item.discount_category}%</span>
                                  <span>-</span>
                                  <span>
                                    Max.{" "}
                                    {formatRupiah(
                                      parseFloat(item.max_price_category),
                                    )}
                                  </span>
                                </p>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}{" "}
                  {parseFloat(input.price) < 100000 && colorData.name_color && (
                    <div className="flex p-3 rounded-md justify-between border border-gray-500 items-center">
                      <div className="flex gap-2 items-center">
                        <div
                          className="w-4 h-4 rounded-full shadow"
                          style={{ background: colorData.hexa_code_color }}
                        />
                        <p className="text-sm font-semibold">
                          {colorData.name_color}
                        </p>
                      </div>
                      <Badge className="bg-gray-200 hover:bg-gray-200 border-gray-500 text-gray-700 rounded-full">
                        {colorData.hexa_code_color}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={
                  (!input.category && parseFloat(input.price) > 100000) ||
                  !input.name ||
                  parseFloat(input.price) === 0 ||
                  parseFloat(input.qty) === 0
                }
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="damaged">
            <form
              onSubmit={(e) => handleSubmit(e, "damaged")}
              className="w-full space-y-6 mt-6"
            >
              <Label>Description:</Label>
              <Textarea
                rows={6}
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={input.damaged}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, damaged: e.target.value }))
                }
              />
              <Button
                type="submit"
                className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={
                  !input.damaged ||
                  !input.name ||
                  parseFloat(input.price) === 0 ||
                  parseFloat(input.qty) === 0
                }
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="abnormal">
            <form
              onSubmit={(e) => handleSubmit(e, "abnormal")}
              className="w-full space-y-6 mt-6"
            >
              <Label>Description:</Label>
              <Textarea
                rows={6}
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={input.abnormal}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, abnormal: e.target.value }))
                }
              />
              <Button
                type="submit"
                className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={
                  !input.abnormal ||
                  !input.name ||
                  parseFloat(input.price) === 0 ||
                  parseFloat(input.qty) === 0
                }
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog
        open={barcodeOpen}
        onOpenChange={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
            setMetaBarcode({
              barcode: "",
              category: "",
              newPrice: "",
              oldPrice: "",
              discount: "",
            });
            if (nameRef.current) {
              nameRef.current.focus();
            }
          } else {
            setBarcodeOpen(true);
          }
        }}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Barcode Printered</DialogTitle>
          </DialogHeader>
          <BarcodePrinted
            oldPrice={oldPrice ?? "0"}
            description={newName ?? "0"}
            barcode={barcode ?? ""}
            category={category ?? ""}
            newPrice={newPrice ?? "0"}
            discount={discount ?? "0"}
            cancel={() => {
              setBarcodeOpen(false);
              setMetaBarcode({
                barcode: "",
                category: "",
                newPrice: "",
                oldPrice: "",
                discount: "",
              });
              if (nameRef.current) {
                nameRef.current.focus();
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
