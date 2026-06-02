import BarcodePrinted from "@/components/barcode";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  AlertCircle,
  ChevronDown,
  Circle,
  Loader,
  Minus,
  Palette,
  Plus,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export const DialogDetail = ({
  isOpen,
  handleClose,
  isLoadingProduct,
  isLoadingUpdate,
  handleUpdate,
  input,
  setInput,
  data,
  isOpenCategory,
  setIsOpenCategory,
  categories,
}: {
  isOpen: boolean;
  handleClose: () => void;
  isLoadingProduct: boolean;
  isLoadingUpdate: boolean;
  handleUpdate: any;
  input: any;
  setInput: any;
  data: any;
  isOpenCategory: any;
  setIsOpenCategory: any;
  categories: any;
}) => {
  const findNotNull = (v: any) => {
    if (v) {
      const qualityObject = JSON.parse(v);

      const filteredEntries = Object.entries(qualityObject).find(
        ([, value]) => value !== null,
      );

      return filteredEntries?.[0] ?? "";
    }
  };
  const [showConfirmPrice, setShowConfirmPrice] = useState(false);
  useEffect(() => {
    let discount = 0;
    if (input.category) {
      const selectedCategory = categories.find(
        (item: any) => item.name_category === input.category,
      );
      discount = selectedCategory
        ? parseFloat(selectedCategory.discount_category ?? "0")
        : 0;
    }

    const oldPrice = parseFloat(input.oldPrice) || 0;
    const newPrice = oldPrice - (oldPrice * discount) / 100;

    setInput((prev: any) => ({
      ...prev,
      price: newPrice.toString(),
    }));
  }, [input.oldPrice, input.category, categories]);

  // selected category and its max price (used in confirmation dialog)
  const selectedCategory = categories?.find(
    (item: any) => item.name_category === input.category,
  );
  const maxPriceCategory = selectedCategory
    ? parseFloat(selectedCategory.max_price_category ?? "0")
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-6xl"
        onClose={false}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail Product
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => handleClose()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>
        {isLoadingProduct || isLoadingUpdate ? (
          <div className="w-full h-[408px] flex items-center justify-center flex-col gap-3">
            <Loader className="size-6 animate-spin" />
            <p className="text-sm ml-1">
              {isLoadingProduct ? "Getting Data..." : "Updating..."}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const oldP = Math.round(parseFloat(input.oldPrice || "0"));
                const newP = Math.round(parseFloat(input.price || "0"));
                const priceChanged = oldP !== newP;
                const discountAmount = oldP - newP;
                const shouldConfirmPrice =
                  priceChanged &&
                  selectedCategory &&
                  maxPriceCategory !== null &&
                  discountAmount > maxPriceCategory;

                if (shouldConfirmPrice) {
                  setShowConfirmPrice(true);
                  return;
                }

                handleUpdate();
              }}
              className="flex flex-col gap-3 w-full"
            >
              <div className="flex gap-3">
                <div className="w-full h-full p-3 gap-3 rounded-md border border-sky-400 flex flex-col">
                  <div className="items-center flex justify-center h-9 rounded w-full bg-sky-100 font-semibold">
                    Old Data
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="barcodeOld"
                        className="text-xs font-semibold"
                      >
                        Barcode
                      </Label>
                      <Input
                        id="barcodeOld"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                        value={input.oldBarcode}
                        disabled
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="nameOld"
                        className="text-xs font-semibold"
                      >
                        Name Product
                      </Label>
                      <Input
                        id="nameOld"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                        value={input.oldName}
                        disabled
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1">
                      <Label className="text-xs font-semibold">Qty</Label>
                      <div className="relative flex items-center">
                        <Input
                          value={input.oldQty}
                          disabled
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col w-full  gap-1">
                      <Label
                        htmlFor="priceOld"
                        className="text-xs font-semibold"
                      >
                        Price
                      </Label>
                      <div className="w-full relative flex items-center">
                        <Input
                          id="priceOld"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                          value={Math.round(parseFloat(input.oldPrice))}
                          onChange={(e) =>
                            setInput((prev: any) => ({
                              ...prev,
                              oldPrice: e.target.value.startsWith("0")
                                ? e.target.value.replace(/^0+/, "")
                                : e.target.value,
                            }))
                          }
                          placeholder="Custom Barcode..."
                        />
                        <p className="absolute right-3 text-xs text-gray-500">
                          {formatRupiah(parseFloat(input.oldPrice))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-full p-3 gap-3 rounded-md border border-sky-400 flex flex-col">
                  <div className="items-center flex justify-center h-9 rounded w-full bg-sky-100 font-semibold">
                    New Data
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="barcodeOld"
                        className="text-xs font-semibold"
                      >
                        Barcode
                      </Label>
                      <Input
                        id="barcodeOld"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                        value={input.barcode}
                        disabled
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="flex flex-col  w-full  gap-1">
                      <Label
                        htmlFor="nameNew"
                        className="text-xs font-semibold"
                      >
                        Name Product
                      </Label>
                      <Input
                        id="nameNew"
                        className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                        value={input.name}
                        onChange={(e) =>
                          setInput((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Custom Barcode..."
                      />
                    </div>
                    <div className="w-full flex-none  flex gap-2 ">
                      <div className="flex flex-col w-full  gap-1">
                        <Label
                          htmlFor="priceNew"
                          className="text-xs font-semibold"
                        >
                          Price
                        </Label>
                        <Input
                          id="priceNew"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                          value={Math.round(parseFloat(input.price))}
                          onChange={(e) =>
                            setInput((prev: any) => ({
                              ...prev,
                              price: e.target.value.startsWith("0")
                                ? e.target.value.replace(/^0+/, "")
                                : e.target.value,
                            }))
                          }
                          placeholder="Custom Barcode..."
                        />
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <Label className="text-xs font-semibold">Qty</Label>
                        <div className="relative flex items-center">
                          <Input
                            value={input.qty}
                            onChange={(e) =>
                              setInput((prev: any) => ({
                                ...prev,
                                qty: e.target.value.startsWith("0")
                                  ? e.target.value.replace(/^0+/, "")
                                  : e.target.value,
                              }))
                            }
                            className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100 disabled:cursor-default"
                          />
                          <div className="flex absolute right-2 gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setInput((prev: any) => ({
                                  ...prev,
                                  qty: (parseFloat(prev.qty) - 1).toString(),
                                }))
                              }
                              disabled={parseFloat(input.qty) === 0}
                              className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200 disabled:hover:bg-sky-100 disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setInput((prev: any) => ({
                                  ...prev,
                                  qty: (parseFloat(prev.qty) + 1).toString(),
                                }))
                              }
                              className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!data?.new_tag_product && (
                      <div className="flex flex-col gap-1 ">
                        <Label className="text-xs font-semibold">
                          Category
                        </Label>
                        <PopoverPortal
                          open={isOpenCategory}
                          onOpenChange={setIsOpenCategory}
                        >
                          <PopoverPortalTrigger asChild>
                            <Button
                              type="button"
                              className="border-0 border-b  rounded-none justify-between border-sky-400/80 focus:border-sky-400 focus-visible:ring-transparent focus:ring-1 hover:bg-sky-50 focus:bg-sky-50 shadow-none"
                              variant={"outline"}
                            >
                              <p>
                                {input.category ??
                                  data?.new_category_product ?? (
                                    <span className="italic underline">
                                      No Category yet.
                                    </span>
                                  )}
                              </p>
                              <ChevronDown />
                            </Button>
                          </PopoverPortalTrigger>
                          <PopoverPortalContent
                            className="p-0"
                            style={{
                              width: "var(--radix-popover-trigger-width)",
                            }}
                          >
                            <Command>
                              <CommandInput />
                              <CommandList className="p-1">
                                <CommandGroup>
                                  <CommandEmpty>No Data Found.</CommandEmpty>
                                  {categories.map((item: any) => (
                                    <CommandItem
                                      key={item.id}
                                      className={cn(
                                        "my-2 first:mt-0 last:mb-0 flex gap-2 items-center border",
                                        input.category === item.name_category
                                          ? "border-gray-500"
                                          : "border-gray-300",
                                      )}
                                      onSelect={() => {
                                        setInput((prev: any) => ({
                                          ...prev,
                                          category: item?.name_category ?? "",
                                          price: (
                                            data?.old_price_product -
                                            (data?.old_price_product / 100) *
                                              parseFloat(
                                                item?.discount_category ?? "0",
                                              )
                                          ).toString(),
                                        }));
                                        setIsOpenCategory(false);
                                      }}
                                    >
                                      <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                        {input.category ===
                                          item.name_category && (
                                          <Circle className="fill-black !size-2.5" />
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-1.5">
                                        <p
                                          className={cn(
                                            "font-bold border-b pb-1.5 whitespace-nowrap text-ellipsis overflow-hidden w-full",
                                            input.category ===
                                              item.name_category
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
                                              parseFloat(
                                                item.max_price_category,
                                              ),
                                            )}
                                          </span>
                                        </p>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverPortalContent>
                        </PopoverPortal>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full flex-none  flex gap-2 border border-sky-400 p-3 rounded-md">
                <div className="flex flex-col w-full  gap-1">
                  <Label htmlFor="priceNew" className="text-xs font-semibold">
                    Discount
                  </Label>
                  <Input
                    id="priceNew"
                    className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                    value={Math.round(parseFloat(input.discount))}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        discount: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                    placeholder="Custom Barcode..."
                  />
                </div>
                <div className="flex flex-col w-full  gap-1">
                  <Label htmlFor="priceNew" className="text-xs font-semibold">
                    Display Price
                  </Label>
                  <Input
                    id="priceNew"
                    className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100"
                    value={formatRupiah(parseFloat(input.displayPrice))}
                    disabled
                  />
                </div>
              </div>
              <Button
                disabled={
                  !input.name ||
                  parseFloat(input.qty) === 0 ||
                  (data?.old_price_product >= 100000 &&
                    !input.category &&
                    findNotNull(data?.new_quality) === "lolos")
                }
                className="bg-sky-400/80 hover:bg-sky-400 text-black"
                type="submit"
              >
                Update
              </Button>
            </form>
            <div className="w-fit flex flex-none flex-col gap-4">
              {data?.new_category_product ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center p-2 rounded border bg-gray-100 gap-2 text-sm">
                    <AlertCircle className="size-4" />
                    <div className="flex flex-col">
                      <p>Update Data terlebih dahulu</p>
                      <p>untuk Barcode terbaru!</p>
                    </div>
                  </div>
                  <BarcodePrinted
                    barcode={data?.new_barcode_product}
                    description={data?.new_name_product}
                    newPrice={data?.display_price}
                    oldPrice={data?.old_price_product}
                    category={data?.new_category_product}
                    discount={data?.discount_category ?? "0"}
                  />
                </div>
              ) : (
                <div className="w-auto">
                  <div className="w-[282px] p-3 flex flex-col gap-3 border border-gray-300 rounded text-sm">
                    <div className="flex items-center text-sm font-semibold border-b border-gray-300 pb-2">
                      <Palette className="w-4 h-4 mr-2" />
                      <p>Color</p>
                    </div>
                    <p className="pl-6">{data?.new_tag_product}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation dialog when price changed */}
        <Dialog
          open={showConfirmPrice}
          onOpenChange={(open) => setShowConfirmPrice(open)}
        >
          <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="max-w-md"
            onClose={false}
          >
            <DialogHeader>
              <DialogTitle>Konfirmasi Ubah Harga</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm">
                Anda yakin ingin mengubah harga dari
                <span className="font-semibold mx-1">
                  {formatRupiah(parseFloat(input.oldPrice || "0"))}
                </span>
                menjadi
                <span className="font-semibold mx-1">
                  {formatRupiah(parseFloat(input.price || "0"))}
                </span>
                ?
              </p>
              {selectedCategory && (
                <p className="text-xs text-gray-600 mt-2">
                  Batas diskon max produk kategori
                  <span className="font-semibold mx-1">
                    {selectedCategory.name_category}
                  </span>
                  = {formatRupiah(maxPriceCategory ?? 0)}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmPrice(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-sky-400/80 hover:bg-sky-400 text-black"
                  onClick={() => {
                    setShowConfirmPrice(false);
                    handleUpdate();
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
