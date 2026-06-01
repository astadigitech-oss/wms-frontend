"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Grid2x2X,
  Loader,
  Search,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useGetCheckManifestInbound } from "../_api/use-get-check-manifest-inbound";
import { useGetCategoriesMI } from "../_api/use-get-categories-mi";
import { useGetBarcodeMI } from "../_api/use-get-barcode-mi";
import { toast } from "sonner";
import Loading from "@/app/(dashboard)/loading";
import { useSubmitProduct } from "../_api/use-submit-product";
import { format } from "date-fns";
import BarcodePrinted from "@/components/barcode";
import { useSubmitDoubleBarcode } from "../_api/use-submit-double-barcode";
import { useSubmitDoneCheckAll } from "../_api/use-submit-done-check-all";
import { useQueryClient } from "@tanstack/react-query";
import { useGetScanPaused } from "../_api/use-get-scan-paused";
import { useEditScan } from "../_api/use-edit-scan";

export const Client = () => {
  const { miId, miMonth, miYear } = useParams();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const [metaData, setMetaData] = useState({
    abnormal: "",
    damaged: "",
    non: "",
    name: "",
    newName: "",
    discount: 0,
    qty: "0",
  });
  const [editNewDataOpen, setEditNewDataOpen] = useState(false);
  const [editNewData, setEditNewData] = useState({
    newName: "",
    qty: "0",
  });

  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [metaBarcode, setMetaBarcode] = useState({
    barcode: "",
    newPrice: "",
    oldPrice: "",
    newName: "",
    category: "",
    discount: "",
  });

  const [SubmitDoubleDialog, confirmSubmit] = useConfirm(
    "Barcode Duplication Confirmation",
    "Confirm to submit the same barcode again, This action cannot be undone",
    "liquid",
  );
  const [DoneAllDialog, confirmDoneAll] = useConfirm(
    "Done check all documents",
    "",
    "liquid",
  );

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);

  const codeDocument = `${miId}/${miMonth}/${miYear}`;

  const { mutate, isPending: isPendingSubmit } = useSubmitProduct();
  const { mutate: mutateDouble, isPending: isPendingDouble } =
    useSubmitDoubleBarcode();
  const { mutate: mutateDoneAll } = useSubmitDoneCheckAll();
  const { mutate: mutateEditScan, isPending: isPendingEditScan } =
    useEditScan();

  const {
    data: dataScanPaused,
    error: errorScanPaused,
    isError: isErrorScanPaused,
    isLoading: isLoadingScanPaused,
    refetch: refetchScanPaused,
  } = useGetScanPaused();

  const scanPaused = !!dataScanPaused?.data.data.resource?.scan_paused;
  const scanApprovalOpen = scanPaused || approvalDialogOpen;
  const approvalBarcode =
    dataScanPaused?.data.data.resource?.barcode_old_product || "-";

  const { data, error, isError } = useGetCheckManifestInbound({
    code: codeDocument,
  });
  const {
    data: dataBarcode,
    error: errorBarcode,
    isError: isErrorBarcode,
    isRefetching: isRefetchingBarcode,
    isLoading: isLoadingBarcode,
    isSuccess: isSuccessBarcode,
  } = useGetBarcodeMI({
    code: codeDocument,
    barcode: searchValue,
    disabled: scanApprovalOpen,
  });

  const { data: dataCategories } = useGetCategoriesMI();

  const loadingBarcode = isRefetchingBarcode || isLoadingBarcode;
  const pageBusy =
    scanApprovalOpen ||
    loadingBarcode ||
    isPendingSubmit ||
    isPendingDouble ||
    isPendingEditScan;

  const document = useMemo(() => {
    return data?.data.data.resource.data[0].base_document;
  }, [data]);

  const barcodeData = useMemo(() => {
    return (
      dataBarcode?.data.data.resource.product ?? {
        id: "0",
        old_barcode_product: "",
        old_name_product: "",
        old_quantity_product: "0",
        old_price_product: "0",
        created_at: "",
      }
    );
  }, [dataBarcode]);

  const tagColor = useMemo(() => {
    return (
      dataBarcode?.data.data.resource?.color_tags?.[0] ?? {
        id: "0",
        hexa_code_color: "",
        name_color: "",
        fixed_price_color: "0",
      }
    );
  }, [dataBarcode]);

  const categories: any[] = useMemo(() => {
    const resource = dataCategories?.data.data.resource;

    if (Array.isArray(resource)) return resource;
    if (Array.isArray(resource?.data)) return resource.data;

    return [];
  }, [dataCategories]);

  const handleDoneCheckAll = async () => {
    const ok = await confirmDoneAll();

    if (!ok) return;

    mutateDoneAll({ code_document: codeDocument });
  };

  const normalizeQty = (value: string) => {
    if (value.length > 1 && value.startsWith("0")) {
      return value.replace(/^0+/, "") || "0";
    }

    return value;
  };

  const handleOpenEditNewData = () => {
    setEditNewData({
      newName: metaData.newName,
      qty: metaData.qty,
    });
    setEditNewDataOpen(true);
  };

  const handleEditNewData = (e: FormEvent) => {
    e.preventDefault();

    const body = {
      id_asal: barcodeData?.id,
      edited_name: editNewData.newName,
      edited_qty: Number(editNewData.qty),
    };

    mutateEditScan(body, {
      onSuccess: () => {
        setMetaData((prev) => ({
          ...prev,
          newName: editNewData.newName,
          qty: editNewData.qty,
        }));
        setEditNewDataOpen(false);
        refetchScanPaused();
        setApprovalDialogOpen(true);
        toast.success("New data successfully edited.");
      },
    });
  };

  const handleSubmitDouble = async (body: any) => {
    const ok = await confirmSubmit();

    if (!ok) return;

    mutateDouble(body, {
      onSuccess: (data) => {
        setDataSearch("");
        setMetaData({
          abnormal: "",
          damaged: "",
          non: "",
          discount: 0,
          newName: "",
          name: "",
          qty: "0",
        });
        if (searchRef.current) {
          searchRef.current.focus();
        }
        setBarcodeOpen(true);
        setMetaBarcode({
          barcode: data.data.data.resource.new_barcode_product,
          newName: data?.data.data.resource.new_name_product,
          newPrice: data.data.data.resource.new_price_product,
          oldPrice: data.data.data.resource.old_price_product,
          category: data.data.data.resource.new_category_product,
          discount: data.data.data.resource.discount_category,
        });
      },
    });
  };

  const handleSubmit = (e: FormEvent, type: string) => {
    e.preventDefault();
    const body = {
      code_document: codeDocument,
      old_barcode_product: barcodeData?.old_barcode_product,
      new_barcode_product: "",
      new_name_product: metaData.newName,
      old_name_product: barcodeData?.old_name_product,
      new_quantity_product: metaData.qty,
      new_price_product:
        parseFloat(barcodeData?.old_price_product) < 100000
          ? tagColor.fixed_price_color
          : parseFloat(barcodeData?.old_price_product) -
            (parseFloat(barcodeData?.old_price_product) / 100) *
              metaData.discount,
      old_price_product: barcodeData?.old_price_product,
      new_date_in_product: format(
        new Date(barcodeData?.created_at),
        "yyyy-MM-dd",
      ),
      new_status_product: "display",
      condition: type,
      new_category_product: type === "lolos" ? metaData.name : "",
      new_tag_product: tagColor?.name_color ?? "",
      deskripsi:
        type === "abnormal"
          ? metaData.abnormal
          : type === "damaged"
            ? metaData.damaged
            : type === "non"
              ? metaData.non
              : "",
    };

    mutate(body, {
      onSuccess: (data) => {
        if (data.data.data.needConfirmation) {
          toast.success(data.data.data.message);
          setDataSearch("");
          setMetaData({
            abnormal: "",
            damaged: "",
            non: "",
            discount: 0,
            newName: "",
            name: "",
            qty: "0",
          });
          if (searchRef.current) {
            searchRef.current.focus();
          }
          setBarcodeOpen(true);
          setMetaBarcode({
            barcode: data.data.data.resource.new_barcode_product,
            newName: data.data.data.resource.new_name_product,
            newPrice: data.data.data.resource.new_price_product,
            oldPrice: data.data.data.resource.old_price_product,
            category: data.data.data.resource.new_category_product,
            discount: data.data.data.resource.discount_category,
          });
        } else if (!data.data.data.needConfirmation) {
          if (data.data.data.message === "The new barcode already exists") {
            toast.error(data.data.data.message);
          } else {
            toast.error(data.data.data.message);
            handleSubmitDouble(body);
          }
        }
      },
    });
  };

  useEffect(() => {
    if (
      (isErrorBarcode && (errorBarcode as AxiosError).status === 404) ||
      (isSuccessBarcode && !dataBarcode?.data.data.status)
    ) {
      toast.error(
        (isSuccessBarcode && `Error: ${dataBarcode?.data.data.message}`) ||
          `Error ${(errorBarcode as AxiosError).status}: ${
            dataBarcode?.data.data.message
          }`,
      );
    } else if (isSuccessBarcode && dataBarcode?.data.data.status) {
      toast.success("Barcode successfully found.");
      const product = dataBarcode.data.data.resource.product;
      const newName =
        product.edited_name_product ?? product.old_name_product ?? "";
      const newQty =
        product.edited_quantity_product ?? product.old_quantity_product ?? 0;

      setMetaData((prev) => ({
        ...prev,
        qty: Math.round(Number(newQty)).toString(),
        newName,
      }));
    }
  }, [dataBarcode]);

  useEffect(() => {
    if (isNaN(parseFloat(metaData.qty))) {
      setMetaData((prev) => ({ ...prev, qty: "0" }));
    }
  }, [metaData]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoadingScanPaused) {
    return <Loading />;
  }

  if (
    (isError && (error as AxiosError)?.status === 403) ||
    (isErrorScanPaused && (errorScanPaused as AxiosError)?.status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }
  if (
    (isError && (error as AxiosError)?.status === 404) ||
    (isErrorScanPaused && (errorScanPaused as AxiosError)?.status === 404)
  ) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <SubmitDoubleDialog />
      <DoneAllDialog />
      <Dialog open={scanApprovalOpen} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md"
          onClose={false}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Scan Perlu Approval</DialogTitle>
            <DialogDescription>
              Sampaikan ke SPV barcode nya perlu di approve.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3">
            <Label className="text-xs text-gray-500">Barcode</Label>
            <p className="mt-1 break-all font-semibold text-black">
              {approvalBarcode}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["manifest-inbound"],
                })
              }
            >
              <BreadcrumbLink href="/inbound/check-product/manifest-inbound/">
                Manifest Inbound
              </BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex text-sm text-gray-500 py-6 rounded-md shadow bg-white w-full px-5 gap-4 items-center relative">
        <div className="w-full text-xs flex items-center">
          <Link
            href={`/inbound/check-product/manifest-inbound/${codeDocument}/detail`}
            className="group"
          >
            <button
              type="button"
              disabled={pageBusy}
              className="flex items-center text-black group-hover:mr-6 mr-4 transition-all w-auto"
            >
              <div className="w-10 h-10 rounded-full group-hover:shadow justify-center flex items-center group-hover:bg-gray-100 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </button>
          </Link>
          <div className="w-2/3">
            <p>Data Name</p>
            <h3 className="text-black font-semibold text-xl">{document}</h3>
          </div>
        </div>
        <Separator orientation="vertical" className="h-16 bg-gray-500" />
        <div className="w-full flex-col flex gap-1">
          <Label className="text-xs">Search Barcode Product</Label>
          <div className="relative w-full flex items-center">
            <Input
              className="w-full border-sky-400/80 focus-visible:ring-sky-400 rounded text-black px-10"
              value={dataSearch}
              onChange={(e) => setDataSearch(e.target.value)}
              placeholder="Search..."
              ref={searchRef}
              autoFocus
              disabled={pageBusy}
            />
            {dataSearch.length > 0 && (
              <button
                className="absolute right-3"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setDataSearch("");
                  if (searchRef.current) {
                    searchRef.current.focus();
                  }
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute left-3">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center">
        <div className="w-full flex gap-2 items-center">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleDoneCheckAll();
            }}
            className="bg-sky-400/80 hover:bg-sky-400 text-black"
            type="button"
            disabled={pageBusy}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Done Check All
          </Button>
        </div>
        {isSuccessBarcode && (
          <div className="flex justify-end gap-2 items-center flex-none">
            <p>Keterangan:</p>
            <Badge className="bg-sky-100 hover:bg-sky-100 border border-sky-500 text-black py-1 gap-1 rounded-full shadow-none">
              {parseFloat(barcodeData?.old_price_product) > 100000 ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
              <p>100K</p>
            </Badge>
          </div>
        )}
      </div>
      {loadingBarcode ||
      isPendingSubmit ||
      isPendingDouble ||
      isPendingEditScan ? (
        <div className="flex flex-col w-full bg-white rounded-md shadow items-center justify-center h-[300px] gap-3">
          <Loader className="size-6 animate-spin" />
          <p className="text-sm ml-1">
            {loadingBarcode
              ? "Getting Data..."
              : isPendingSubmit
                ? "Submiting..."
                : isPendingDouble
                  ? "Submiting Double..."
                  : "Editing..."}
          </p>
        </div>
      ) : barcodeData?.id === "0" ? (
        <div className="flex w-full bg-white rounded-md shadow items-center justify-center h-[300px]">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Grid2x2X className="w-8 h-8" />
            <p className="text-sm font-semibold">No Data Viewed.</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <div className="flex w-full gap-4">
            <div className="w-full">
              <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
                <h2 className="text-xl font-bold">Old Data</h2>
                <div className="flex w-full items-center gap-4 flex-col">
                  <div className="w-full flex gap-4">
                    <div className="flex flex-col w-full gap-1">
                      <Label>Barcode</Label>
                      <Input
                        value={barcodeData?.old_barcode_product}
                        disabled
                        className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1">
                      <Label>Name</Label>
                      <Input
                        value={barcodeData?.old_name_product}
                        disabled
                        className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                      />
                    </div>
                  </div>
                  <div className="flex w-full gap-4">
                    <div className="flex flex-col w-full gap-1">
                      <Label>Price</Label>
                      <Input
                        value={formatRupiah(
                          parseFloat(barcodeData?.old_price_product),
                        )}
                        disabled
                        className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1">
                      <Label>Qty</Label>
                      <Input
                        value={parseFloat(
                          barcodeData?.old_quantity_product,
                        ).toLocaleString()}
                        disabled
                        className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {parseFloat(barcodeData?.old_price_product) > 100000 ? (
              <div className="w-full">
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">New Data</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-sky-400/80 hover:bg-sky-50"
                      onClick={handleOpenEditNewData}
                      disabled={pageBusy}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex w-full items-center gap-4 flex-col">
                    <div className="flex flex-col w-full gap-1">
                      <Label>Name</Label>
                      <Input
                        value={metaData.newName}
                        disabled
                        className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                      />
                    </div>
                    <div className="w-full flex gap-4">
                      <div className="flex flex-col w-full gap-1">
                        <Label>Price</Label>
                        <Input
                          value={formatRupiah(
                            parseFloat(barcodeData?.old_price_product) -
                              (parseFloat(barcodeData?.old_price_product) /
                                100) *
                                metaData.discount,
                          )}
                          disabled
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <Label>Qty</Label>
                        <Input
                          value={metaData.qty}
                          disabled
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">New Data</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-sky-400/80 hover:bg-sky-50"
                      onClick={handleOpenEditNewData}
                      disabled={pageBusy}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex w-full items-center gap-4 flex-col">
                    <div className="w-full flex gap-4">
                      <div className="flex flex-col w-full gap-1">
                        <Label>Tag Color</Label>
                        <div className="flex w-full gap-2 items-center border rounded-md border-sky-500 px-5 h-9 cursor-default">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: tagColor?.hexa_code_color }}
                          />
                          <p className="text-sm">{tagColor?.name_color}</p>
                        </div>
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <Label>Name</Label>
                        <Input
                          value={metaData.newName}
                          disabled
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                    </div>
                    <div className="w-full flex gap-4">
                      <div className="flex flex-col w-full gap-1">
                        <Label>Price</Label>
                        <Input
                          value={formatRupiah(
                            parseFloat(tagColor?.fixed_price_color),
                          )}
                          disabled
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <Label>Qty</Label>
                        <Input
                          value={metaData.qty}
                          disabled
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <TabsTrigger className="w-32" value="non">
                    Non
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="good">
                <form
                  onSubmit={(e) => handleSubmit(e, "lolos")}
                  className="w-full space-y-6 mt-6"
                >
                  {parseFloat(barcodeData?.old_price_product) >= 100000 && (
                    <div className="w-full flex flex-col gap-3">
                      <RadioGroup
                        onValueChange={(e) => {
                          const selectedCategory = categories.find(
                            (item) => item.name_category === e,
                          );
                          setMetaData((prev) => ({
                            ...prev,
                            name: selectedCategory?.name_category ?? "",
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
                              metaData.name === item.name_category
                                ? "border-gray-500 bg-sky-100"
                                : "border-gray-300",
                            )}
                          >
                            <RadioGroupItem
                              value={item.name_category}
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
                                  metaData.name === item.name_category
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
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                    disabled={
                      metaData.qty === "0" ||
                      (parseFloat(barcodeData?.old_price_product) > 100000 &&
                        !metaData.name)
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
                    value={metaData.damaged}
                    onChange={(e) =>
                      setMetaData((prev) => ({
                        ...prev,
                        damaged: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="submit"
                    className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                    disabled={metaData.qty === "0" || !metaData.damaged}
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
                    value={metaData.abnormal}
                    onChange={(e) =>
                      setMetaData((prev) => ({
                        ...prev,
                        abnormal: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="submit"
                    className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                    disabled={metaData.qty === "0" || !metaData.abnormal}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="non">
                <form
                  onSubmit={(e) => handleSubmit(e, "non")}
                  className="w-full space-y-6 mt-6"
                >
                  <Label>Description:</Label>
                  <Textarea
                    rows={6}
                    className="border-sky-400/80 focus-visible:ring-sky-400"
                    value={metaData.non}
                    onChange={(e) =>
                      setMetaData((prev) => ({
                        ...prev,
                        non: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="submit"
                    className="w-full bg-sky-400/80 hover:bg-sky-400 text-black"
                    disabled={metaData.qty === "0" || !metaData.non}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
      <Dialog open={editNewDataOpen} onOpenChange={setEditNewDataOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit New Data</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditNewData} className="space-y-4">
            <div className="flex flex-col w-full gap-1">
              <Label>Name</Label>
              <Input
                value={editNewData.newName}
                onChange={(e) =>
                  setEditNewData((prev) => ({
                    ...prev,
                    newName: e.target.value,
                  }))
                }
                className="w-full border-sky-400/80 focus-visible:ring-sky-400"
              />
            </div>
            <div className="flex flex-col w-full gap-1">
              <Label>Qty</Label>
              <Input
                value={editNewData.qty}
                onChange={(e) =>
                  setEditNewData((prev) => ({
                    ...prev,
                    qty: normalizeQty(e.target.value),
                  }))
                }
                className="w-full border-sky-400/80 focus-visible:ring-sky-400"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditNewDataOpen(false)}
                disabled={isPendingEditScan}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-400/80 hover:bg-sky-400 text-black"
                disabled={
                  isPendingEditScan ||
                  !editNewData.newName ||
                  editNewData.qty === "0"
                }
              >
                {isPendingEditScan ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                Edit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={barcodeOpen}
        onOpenChange={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
            setMetaBarcode({
              barcode: "",
              category: "",
              newPrice: "",
              newName: "",
              oldPrice: "",
              discount: "",
            });
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
            oldPrice={metaBarcode.oldPrice ?? "0"}
            description={metaBarcode.newName ?? ""}
            barcode={metaBarcode.barcode ?? ""}
            category={metaBarcode.category ?? ""}
            newPrice={metaBarcode.newPrice ?? "0"}
            discount={metaBarcode.discount ?? "0"}
            cancel={() => {
              setBarcodeOpen(false);
              setMetaBarcode({
                barcode: "",
                category: "",
                newPrice: "",
                oldPrice: "",
                newName: "",
                discount: "",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
