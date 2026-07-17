"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState, useEffect } from "react";
import { useGetCategoriesBundlingBySku } from "../_api/use-get-categories-sku";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, formatRupiah } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useGetTagBundlingBySku } from "../_api/use-get-tag-bundling";
import { useParams } from "next/navigation";
import { useGetDetailProduct } from "../_api/use-get-detail-product";
import { useAddBundle } from "../_api/use-submit-bundle-sku";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BarcodePrintPreview from "@/components/barcode-print-preview";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCheckBundleType } from "../_api/use-post-check-bundle-type";
import { useGetListTagColorWMS } from "../_api/use-get-list-tag-color-wms";

export const Client = () => {
  const { skuId, skuMonth, skuYear, productId } = useParams();
  const codeDocument = `${skuId}/${skuMonth}/${skuYear}`;
  const queryClient = useQueryClient();
  const [input, setInput] = useState({
    perBundle: "0",
    bundle: "1",
  });

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState<any[]>([]);
  const [bundleType, setBundleType] = useState<"regular" | "small" | "big">(
    "regular",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const colorQuery = useMemo(() => {
    if (bundleType === "small") return "small";
    if (bundleType === "big") return "big";
    return null;
  }, [bundleType]);

  const { mutate: submitBundle, isPending } = useAddBundle({ id: productId });
  const { mutate: checkBundleType, isPending: isChecking } =
    useCheckBundleType();

  const { data: dataProduct } = useGetDetailProduct({ id: productId });
  const { data: dataColorTag, isFetching: isFetchingColor } =
    useGetListTagColorWMS({
      q: colorQuery,
    });

  const detailsProduct = useMemo(() => {
    return dataProduct?.data?.data?.resource || {};
  }, [dataProduct]);

  /* =======================
   * PRICE
   * ======================= */
  const fixedPriceByColor = useMemo(() => {
    const item = dataColorTag?.data?.data?.resource?.[0];
    return item?.fixed_price_color ? Number(item.fixed_price_color) : 0;
  }, [dataColorTag]);

  const hargaSatuan = Number(detailsProduct?.price_product) || 0;
  const hargaBundle = useMemo(() => {
    const result = (Number(input.perBundle) || 0) * hargaSatuan;

    return Math.round(result);
  }, [input.perBundle, hargaSatuan]);

  const showCategory = hargaBundle >= 100000 && bundleType === "regular";
  const isBelow100k = hargaBundle < 100000;

  /* =======================
   * STOCK
   * ======================= */
  const totalSekarang = Number(detailsProduct?.quantity_product) || 0;

  const totalSesudah = useMemo(() => {
    const result =
      totalSekarang -
      (Number(input.bundle) || 0) * (Number(input.perBundle) || 0);

    return Math.round(result);
  }, [totalSekarang, input.bundle, input.perBundle]);

  /* =======================
   * TAG (<100K)
   * ======================= */
  const bodyTag = useMemo(
    () => ({
      items_per_bundle: Math.round(Number(input.perBundle) || 0),
    }),
    [input.perBundle],
  );

  const { data: dataTag, isFetching } = useGetTagBundlingBySku(
    productId,
    bodyTag,
    isBelow100k,
  );

  const tag = useMemo(() => {
    return dataTag?.data?.resource;
  }, [dataTag]);

  /* =======================
   * CATEGORY
   * ======================= */
  const { data: dataCategories } = useGetCategoriesBundlingBySku();

  const categories: any[] = useMemo(() => {
    return dataCategories?.data?.data?.resource || [];
  }, [dataCategories]);

  /* =======================
   * DISCOUNT (ROUND)
   * ======================= */
  const discountAmount = useMemo(() => {
    if (!showCategory || !selectedCategory) return 0;

    const percentDiscount =
      hargaBundle * (Number(selectedCategory.discount_category) / 100);

    const discount = Math.min(
      percentDiscount,
      Number(selectedCategory.max_price_category),
    );

    return Math.round(discount);
  }, [hargaBundle, selectedCategory, showCategory]);

  const finalPrice = useMemo(() => {
    // 🔹 SMALL / BIG → FIXED PRICE dari color tag
    if (bundleType === "small" || bundleType === "big") {
      return Math.round(fixedPriceByColor);
    }

    // 🔹 REGULAR
    if (!showCategory) {
      return hargaBundle;
    }

    return Math.round(hargaBundle - discountAmount);
  }, [
    bundleType,
    fixedPriceByColor,
    hargaBundle,
    discountAmount,
    showCategory,
  ]);

  const submitAddBundle = (payload: any) => {
    submitBundle(payload, {
      onSuccess: (res) => {
        toast.success("Bundle berhasil ditambahkan");

        const products = res.data.data.resource.generated_products || [];

        if (!products.length) {
          toast.error("Barcode tidak ditemukan");
          return;
        }

        const mappedBarcodes = products.map((item: any) => ({
          barcode: item.new_barcode_product,
          oldPrice: String(hargaBundle),
          newPrice: String(item.new_price_product),
          description: item.new_name_product || "",
          category: item.category ?? item.tag,
          discount: selectedCategory
            ? String(selectedCategory.discount_category)
            : undefined,
          isBundle: true,
          colorHex: item.tag?.hex_color,
        }));

        setBarcodeItems(mappedBarcodes);
        setBarcodeOpen(true);
        setInput({ perBundle: "0", bundle: "1" });

        queryClient.invalidateQueries({
          queryKey: ["detail-bundling-product-sku", productId],
        });
        queryClient.invalidateQueries({
          queryKey: ["detail-bundling-product-sku", codeDocument, productId],
        });
        queryClient.invalidateQueries({
          queryKey: ["check-categories-product-by-sku-bundling"],
        });
        queryClient.invalidateQueries({
          queryKey: ["check-tag-product-by-sku-bundling"],
        });
        queryClient.invalidateQueries({
          queryKey: ["list-history-bundling-sku"],
        });
      },
    });
  };
  const handleSubmit = () => {
    if (!input.perBundle || !input.bundle) {
      toast.error("Per bundle dan bundle wajib diisi");
      return;
    }

    if (
      bundleType === "regular" &&
      hargaBundle >= 100000 &&
      !selectedCategory
    ) {
      toast.error("Category wajib dipilih untuk bundle Regular");
      return;
    }

    if (!bundleType) {
      toast.error("Bundle type wajib dipilih");
      return;
    }

    const payload = {
      items_per_bundle: input.perBundle,
      bundle_quantity: input.bundle,
      bundle_type: bundleType,
      ...(bundleType === "regular" &&
        hargaBundle >= 100000 && {
          new_category_product: selectedCategory?.name_category,
        }),
    };

    checkBundleType(
      {
        product_id: productId as string,
        items_per_bundle: input.perBundle,
        selected_type: bundleType,
      },
      {
        onSuccess: (res) => {
          const isMatch = res.data?.is_mismatch;
          if (isMatch) {
            setPendingPayload(payload);
            setConfirmMessage(
              res.data?.message ||
                "Tipe bundle ini sudah pernah digunakan. Apakah kamu yakin ingin melanjutkan?",
            );
            setConfirmOpen(true);
          } else {
            // langsung submit
            submitAddBundle(payload);
          }
        },
      },
    );
  };

  useEffect(() => {
    if (!showCategory) {
      setSelectedCategory(null);
    }
  }, [showCategory]);

  useEffect(() => {
    if (bundleType !== "regular") {
      setSelectedCategory(null);
    }
  }, [bundleType]);

  useEffect(() => {
    if (isNaN(parseFloat(input.perBundle))) {
      setInput((prev) => ({ ...prev, perBundle: "0" }));
    }
    if (isNaN(parseFloat(input.bundle))) {
      setInput((prev) => ({ ...prev, bundle: "0" }));
    }
  }, [input]);

  return (
    <div className="flex flex-col bg-gray-100 w-full px-4 gap-4 py-4">
      <Dialog open={barcodeOpen} onOpenChange={setBarcodeOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview Barcode ({barcodeItems.length})</DialogTitle>
          </DialogHeader>

          <BarcodePrintPreview
            items={barcodeItems}
            onClose={() => {
              setBarcodeOpen(false);
              setBarcodeItems([]);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Bundling</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">{confirmMessage}</p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded border"
              onClick={() => {
                setConfirmOpen(false);
                setPendingPayload(null);
              }}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 rounded bg-sky-400 text-black"
              onClick={() => {
                if (pendingPayload) {
                  submitAddBundle(pendingPayload);
                  setPendingPayload(null);
                  setConfirmOpen(false);
                }
              }}
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["list-document-sku"],
                })
              }
            >
              <BreadcrumbLink href="/inventory/product/sku">Sku</BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/inventory/product/sku/${codeDocument}/detail`}
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["detail-product-sku"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["list-history-bundling-sku"],
                });
              }}
            >
              Detail
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>Bundling</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full bg-white rounded-md shadow border p-4">
        <div className="flex justify-between items-start gap-6">
          {/* LEFT INFO */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <BreadcrumbLink
                href={`/inventory/product/sku/${codeDocument}/detail`}
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["detail-product-sku"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["list-history-bundling-sku"],
                  });
                }}
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-200"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
              </BreadcrumbLink>

              <h2 className="text-lg font-semibold">Bundling</h2>
            </div>{" "}
            <div>
              <p className="text-sm text-gray-500">Nama Dokumen</p>
              <p className="font-semibold">{detailsProduct?.code_document}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nama Product</p>
              <p className="font-semibold">{detailsProduct?.name_product}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Sekarang</p>
              <p className="font-semibold">{totalSekarang}</p>
            </div>

            <div>
              <p className="text-gray-500">Total Sesudah</p>
              <p className="font-semibold">{totalSesudah}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Per Bundle</p>
              <Input
                type="number"
                className="w-full border focus-visible:ring-sky-400 rounded px-2 py-1"
                value={input.perBundle}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    perBundle: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="text-gray-500 mb-1">Bundle</p>
              <Input
                type="number"
                className="w-full border focus-visible:ring-sky-400 rounded px-2 py-1"
                value={input.bundle}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    bundle: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="text-gray-500">Harga Satuan</p>
              <p className="font-semibold">{formatRupiah(hargaSatuan)}</p>
            </div>

            <div>
              <p className="text-gray-500">Harga Bundle</p>
              <p className="font-semibold">{formatRupiah(hargaBundle)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 flex flex-col justify-between">
          {isBelow100k ? (
            <div>
              <p className="text-gray-500 text-sm">Tag Color</p>
              {isFetching ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : tag ? (
                <>
                  <span
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{ backgroundColor: tag.hex_color }}
                  >
                    {tag.tag_name}
                  </span>
                  <p className="font-semibold mt-2">
                    {formatRupiah(Math.round(tag.fixed_price))}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">No tag</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-sm">Price After Discount</p>
              <p className="text-lg font-semibold text-black mt-3">
                {isFetchingColor &&
                (bundleType === "small" || bundleType === "big")
                  ? "Loading..."
                  : formatRupiah(finalPrice)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending || isChecking}
          className="bg-sky-400 hover:bg-sky-500 disabled:opacity-50 px-6 py-2 rounded"
        >
          {isChecking ? "Checking..." : isPending ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* {showCategory && ( */}
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center">
        <Tabs
          value={bundleType}
          onValueChange={(value) =>
            setBundleType(value as "regular" | "small" | "big")
          }
          className="w-full"
        >
          <div className="w-full flex justify-center">
            <TabsList className="bg-sky-100">
              <TabsTrigger className="w-32" value="regular">
                Regular
              </TabsTrigger>
              <TabsTrigger className="w-32" value="small">
                Small
              </TabsTrigger>
              <TabsTrigger className="w-32" value="big">
                Big
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="regular">
            <form className="w-full space-y-6 mt-6">
              {/* {showCategory && ( */}
              <div className="w-full flex flex-col gap-3">
                <RadioGroup
                  className="grid grid-cols-4 gap-6"
                  onValueChange={(value) => {
                    const cat = categories.find(
                      (item) => item.name_category === value,
                    );
                    setSelectedCategory(cat);
                  }}
                >
                  {categories.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "border rounded-md px-4 py-3 bg-sky-50",
                        selectedCategory?.id === item.id
                          ? "border-sky-500 bg-sky-100"
                          : "border-gray-300",
                      )}
                    >
                      <RadioGroupItem
                        value={item.name_category}
                        id={String(item.id)}
                      />
                      <Label htmlFor={String(item.id)}>
                        <p className="font-bold">{item.name_category}</p>
                        <p className="text-xs">
                          {item.discount_category}% - Max{" "}
                          {formatRupiah(Math.round(item.max_price_category))}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {/* )} */}
            </form>
          </TabsContent>
          <TabsContent value="small">
            <form className="w-full space-y-4 mt-6">
              <p className="text-sm text-gray-500">Tag Color & Fixed Price</p>

              {isFetchingColor ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : dataColorTag?.data?.data?.resource?.[0] ? (
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{
                      backgroundColor:
                        dataColorTag.data.data.resource[0].hexa_code_color,
                    }}
                  >
                    {dataColorTag.data.data.resource[0].name_color}
                  </span>

                  <p className="text-lg font-semibold">
                    {formatRupiah(
                      Math.round(
                        Number(
                          dataColorTag.data.data.resource[0].fixed_price_color,
                        ),
                      ),
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No tag color</p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="big">
            <form className="w-full space-y-4 mt-6">
              <p className="text-sm text-gray-500">Tag Color & Fixed Price</p>

              {isFetchingColor ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : dataColorTag?.data?.data?.resource?.[0] ? (
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{
                      backgroundColor:
                        dataColorTag.data.data.resource[0].hexa_code_color,
                    }}
                  >
                    {dataColorTag.data.data.resource[0].name_color}
                  </span>

                  <p className="text-lg font-semibold">
                    {formatRupiah(
                      Math.round(
                        Number(
                          dataColorTag.data.data.resource[0].fixed_price_color,
                        ),
                      ),
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No tag color</p>
              )}
            </form>{" "}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
