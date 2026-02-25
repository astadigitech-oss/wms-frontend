"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowRightCircle,
  FileDown,
  HistoryIcon,
  Loader2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { parseAsString, useQueryState } from "nuqs";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetListRacks } from "../_api/use-get-list-racks";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { Input } from "@/components/ui/input";
import { useCreateRack } from "../_api/use-create-rack";
import { useUpdateRack } from "../_api/use-update-rack";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteRack } from "../_api/use-delete-rack";
import { useGetListProduct } from "../_api/use-get-list-product";
import Pagination from "@/components/pagination";
import { columnProductStaging, columnRackStaging } from "./columns";
import { useAddFilterProductStaging } from "../_api/use-add-filter-product-staging";
import { useExportStagingProduct } from "../_api/use-export-staging-product";
import { DialogDetail } from "./dialog-detail";
import { DialogToLPR } from "./dialog-to-lpr";
import { DialogFiltered } from "./dialog-filtered";
import { useGetListCategories } from "../_api/use-get-list-categories";
import { useSubmit } from "../_api/use-submit";
import { useDryScrap } from "../_api/use-dry-scrap";
import DialogBarcode from "./dialog-barcode";
import { useMigrateToRepair } from "../_api/use-migrate-to-repair";
import { useToDamaged } from "../_api/use-to-damaged";
import { DialogDamaged } from "./dialog-damaged";
import { useScanSOProduct } from "../_api/use-scan-so-product";
import { useStockOpname } from "../_api/use-stock-opname";
import { useScanSOrack } from "../_api/use-scan-so-rack";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useExportStagingRack } from "../_api/use-export-staging-rack";
const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});

export const Client = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );
  const [productId, setProductId] = useQueryState(
    "id",
    parseAsString.withDefault(""),
  );
  // rack Id for Edit
  const [rackId, setRackId] = useQueryState("rackId", {
    defaultValue: "",
  });
  const [isMounted, setIsMounted] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [selectedNameRack, setSelectedNameRack] = useState("");
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [selectedTotalProduct, setSelectedTotalProduct] = useState("");
  const [isOpenDamaged, setIsOpenDamaged] = useState(false);
  const [damagedDescription, setDamagedDescription] = useState("");
  const [damagedProductId, setDamagedProductId] = useState("");
  const [source, setSource] = useState("");
  const [damagedBarcode, setDamagedBarcode] = useState("");
  const [SOProductInput, setSOProductInput] = useState("");
  const [SORackInput, setSORackInput] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // separate search states for rack and product so values don't collide
  const {
    search: searchRack,
    searchValue: searchValueRack,
    setSearch: setSearchRack,
  } = useSearchQuery("qRack");

  const {
    search: searchProduct,
    searchValue: searchValueProduct,
    setSearch: setSearchProduct,
  } = useSearchQuery("qProduct");

  const { searchValue: searchValueCategories } = useSearchQuery("qCategories");

  // local input state stored at parent level so values survive tab unmounts
  const [searchRackInput, setSearchRackInput] = useState<string>(
    (searchRack as string) ?? "",
  );
  const [searchProductInput, setSearchProductInput] = useState<string>(
    (searchProduct as string) ?? "",
  );

  // keep local input in sync when query state changes externally
  useEffect(() => {
    setSearchRackInput((searchRack as string) ?? "");
  }, [searchRack]);

  useEffect(() => {
    setSearchProductInput((searchProduct as string) ?? "");
  }, [searchProduct]);

  const { metaPage, page, setPage, setPagination } = usePagination("p");

  const {
    metaPage: metaPageProduct,
    page: pageProduct,
    setPage: setPageProduct,
    setPagination: setPaginationProduct,
  } = usePagination("pProduct");

  // data form create edit
  type InputState = {
    displayId: string;
    source: string;
    name: string;
    display: { id: string; name: string };
  };

  const [input, setInput] = useState<InputState>({
    displayId: "",
    source: "staging",
    name: "",
    display: { id: "", name: "" },
  });

  // confirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Rack Stagging",
    "This action cannot be undone",
    "destructive",
  );

  const [ToDisplayDialog, confirmToDisplay] = useConfirm(
    "To Display Rack",
    "This action cannot be undone",
    "destructive",
  );

  const [DialogDryScrap, confirmDryScrap] = useConfirm(
    "Dry Scrap Product Stagging",
    "This action cannot be undone",
    "destructive",
  );

  const [DialogMigrateToRepair, confirmMigrateToRepair] = useConfirm(
    "Migrate Product Stagging to Repair",
    "This action cannot be undone",
    "destructive",
  );

  const [SoRackDialog, confirmSoRack] = useConfirm(
    "SO Rack Stagging",
    "This action cannot be undone",
    "liquid",
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteRack();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateRack();
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateRack();
  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterProductStaging();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportStagingProduct();
  const { mutate: mutateExportRack, isPending: isPendingExportRack } =
    useExportStagingRack();
  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();
  const { mutate: mutateDryScrap, isPending: isPendingDryScrap } =
    useDryScrap();
  const { mutate: mutateMigrateToRepair, isPending: isPendingMigrateToRepair } =
    useMigrateToRepair();
  const { mutate: mutateDamaged, isPending: isPendingDamaged } = useToDamaged();
  const { mutate: mutateScanSO, isPending: isPendingScanSO } =
    useScanSOProduct();
  const { mutate: mutateStockOpname, isPending: isPendingStockOpname } =
    useStockOpname();
  const { mutate: mutateScanSORack, isPending: isPendingScanSORack } =
    useScanSOrack();

  const {
    data: dataRacks,
    refetch: refetchRacks,
    isLoading: isLoadingRacks,
    isRefetching: isRefetchRacks,
    isError: isErrorRacks,
    error: errorRacks,
    isSuccess: isSuccessRacks,
  } = useGetListRacks({
    p: page,
    q: searchValueRack,
  });

  const {
    data: dataProducts,
    refetch: refetchProducts,
    isLoading: isLoadingProducts,
    isRefetching: isRefetchingProducts,
    isPending: isPendingProducts,
    isError: isErrorProducts,
    error: errorProducts,
    isSuccess: isSuccessProducts,
  } = useGetListProduct({
    p: pageProduct,
    q: searchValueProduct, // product tab has its own search input
  });

  const { data: dataCategories } = useGetListCategories({
    p: page,
    q: searchValueCategories,
  });

  const rackData = useMemo(() => {
    return dataRacks?.data.data.resource;
  }, [dataRacks]);
  const racksData = rackData?.racks;
  const totalRacks = rackData?.total_racks;

  const productData = useMemo(() => {
    return dataProducts?.data.data.resource.data;
  }, [dataProducts]);

  const CategoriesData = useMemo(() => {
    return dataCategories?.data.data.resource;
  }, [dataCategories]);

  const loading =
    isLoadingProducts ||
    isRefetchingProducts ||
    isPendingProducts ||
    isPendingAddFilter ||
    isPendingExport ||
    isPendingSubmit ||
    isPendingDryScrap ||
    isPendingMigrateToRepair ||
    isPendingScanSO ||
    isPendingStockOpname ||
    isLoadingRacks ||
    isPendingDelete ||
    isPendingCreate ||
    isPendingExportRack ||
    isPendingUpdate;

  // handle close
  const handleClose = () => {
    setIsOpen("");
    setRackId("");
    setInput((prev) => ({
      ...prev,
      displayId: "",
      name: "",
      display: { id: "", name: "" },
    }));
  };

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const handleExportRack = async () => {
    mutateExportRack("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const handleAddFilter = (id: any) => {
    mutateAddFilter({ id });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      display_rack_id: input.displayId,
      source: input.source ?? "staging",
      name: input.display.name,
    };
    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      display_rack_id: input.displayId,
      name: input.display.name,
    };
    mutateUpdate(
      { id: rackId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  // handle to damaged
  const handleSubmitDamaged = () => {
    mutateDamaged(
      {
        body: {
          description: damagedDescription,
          product_id: damagedProductId,
          source: source,
        },
      },
      {
        onSuccess: () => {
          setIsOpenDamaged(false);
          setDamagedDescription("");
          setDamagedProductId("");
          setSource("");
        },
      },
    );
  };

  // handle scan SO Barang
  const handleScanSOProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!SOProductInput.trim()) return;

    mutateScanSO(
      { barcode: SOProductInput },
      {
        onSuccess: () => {
          setSOProductInput("");
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.data?.message ||
            "Barang gagal di-SO";

          setErrorMessage(message);
          setOpenErrorDialog(true);
        },
      },
    );
  };

  // handle scan SO Rack
  const handleScanSORack = (e: FormEvent) => {
    e.preventDefault();
    if (!SORackInput.trim()) return;
    const title = `SO Rack Stagging barcode ${SORackInput}`;

    (async () => {
      const ok = await confirmSoRack(title);
      if (!ok) return;

      mutateScanSORack(
        { barcode: SORackInput },
        {
          onSuccess: () => {
            setSORackInput("");
          },
          onError: (error: any) => {
            const message =
              error?.response?.data?.message ||
              error?.response?.data?.data?.message ||
              "Barang gagal di-SO";

            setErrorMessage(message);
            setOpenErrorDialog(true);
          },
        },
      );
    })();
  };

  // handle stock opname
  const handleStockOpname = async (id: any) => {
    const foundRack = racksData?.data?.find(
      (r: any) => String(r.id) === String(id),
    );
    const barcode = selectedBarcode || foundRack?.barcode || "";
    const name =
      selectedNameRack || foundRack?.display?.name || foundRack?.name || "";

    const title = `SO Rack Stagging barcode ${barcode}${name ? ` nama rak ${name}` : ""}`;

    const ok = await confirmSoRack(title);

    if (!ok) return;
    mutateStockOpname(
      { id },
      {
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.data?.message ||
            "Barang gagal di-SO";

          setErrorMessage(message);
          setOpenErrorDialog(true);
        },
      },
    );
  };

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  const handleSubmit = async (id: any) => {
    const ok = await confirmToDisplay();

    if (!ok) return;
    mutateSubmit({ id });
  };

  const handleDryScrap = async (id: any) => {
    const ok = await confirmDryScrap();

    if (!ok) return;
    mutateDryScrap({ id });
  };

  const handleMigrateToRepair = async (id: any) => {
    const ok = await confirmMigrateToRepair();

    if (!ok) return;
    mutateMigrateToRepair({ id });
  };

  useEffect(() => {
    if (dataProducts && isSuccessProducts) {
      setPaginationProduct(dataProducts?.data.data.resource);
    }
  }, [dataProducts, isSuccessProducts]);

  useEffect(() => {
    if (dataRacks && isSuccessRacks) {
      setPagination(dataRacks?.data.data.resource.racks);
    }
  }, [dataRacks, isSuccessRacks]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isErrorRacks && (errorRacks as AxiosError).status === 403) ||
    (isErrorProducts && (errorProducts as AxiosError).status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteDialog />
      <SoRackDialog />
      <ToDisplayDialog />
      <DialogDryScrap />
      <DialogMigrateToRepair />
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        barcode={selectedBarcode}
        qty={selectedTotalProduct}
        name={selectedNameRack}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
      />
      <DialogCreateEdit
        open={isOpen === "create-edit"}
        onOpenChange={() => {
          if (isOpen === "create-edit") {
            setIsOpen("");
            setRackId("");
          }
        }}
        rackId={rackId} // rackId
        input={input} // input form
        setInput={setInput} // setInput Form
        categories={CategoriesData?.data ?? CategoriesData}
        // categories={uniqueCategoryList} // unique categories
        handleCreate={handleCreate} // handle create rack
        handleUpdate={handleUpdate} // handle update rack
        isPendingCreate={isPendingCreate} // loading create
        isPendingUpdate={isPendingUpdate} // loading update
      />
      <DialogDetail
        open={isOpen === "detail"}
        onOpenChange={() => {
          if (isOpen === "detail") {
            setIsOpen("");
            setProductId("");
          }
        }}
        productId={productId}
      />
      <DialogToLPR
        open={isOpen === "lpr"}
        onOpenChange={() => {
          if (isOpen === "lpr") {
            setIsOpen("");
            setProductId("");
          }
        }}
        productId={productId}
      />
      <DialogFiltered
        open={isOpen === "filtered"}
        onOpenChange={() => {
          if (isOpen === "filtered") {
            setIsOpen("");
          }
        }}
      />
      <DialogDamaged
        isOpen={isOpenDamaged}
        handleClose={() => setIsOpenDamaged(false)}
        barcode={damagedBarcode}
        description={damagedDescription}
        setDescription={setDamagedDescription}
        isLoading={isPendingDamaged}
        handleSubmit={handleSubmitDamaged}
      />
      <Dialog open={openErrorDialog} onOpenChange={setOpenErrorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">SO Gagal</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-700">{errorMessage}</div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setOpenErrorDialog(false)}
              className="bg-sky-400 hover:bg-sky-400/80 text-black"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Stagging</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Rack</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4 mb-6">
        {/* Card: Total Rack */}
        <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
          <h4 className="text-sm text-gray-500">Total Rack</h4>
          <p className="text-3xl font-bold mt-2">{totalRacks} </p>
        </div>

        {/* Card: Total Product */}
        <div className="bg-white shadow rounded-xl p-5 flex flex-col border border-gray-200">
          <h4 className="text-sm text-gray-500">Total Products Rack</h4>
          <p className="text-3xl font-bold mt-2">
            {rackData?.total_products_in_racks}{" "}
          </p>
        </div>
      </div>
      <Tabs className="w-full mt-5" defaultValue="rack">
        <div className="relative w-full flex justify-center">
          <TabsList className="absolute -top-12 p-1 h-auto border-2 border-white shadow bg-gray-200">
            <TabsTrigger
              className="px-5 py-2 data-[state=active]:text-black text-gray-700"
              value="rack"
            >
              List Rak
            </TabsTrigger>
            <TabsTrigger
              className="px-5 py-2 data-[state=active]:text-black text-gray-700"
              value="product"
            >
              List Product
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="rack" className="w-full gap-4 flex flex-col">
          <div className="bg-white shadow rounded-xl p-5 border border-gray-200 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">SO Rack Disini</h3>
            <form onSubmit={handleScanSORack} className="flex flex-col gap-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Scan Barcode Rack
                  </label>
                  <Input
                    type="text"
                    className="border-sky-400/80 focus-visible:ring-sky-400"
                    value={SORackInput}
                    onChange={(e) => setSORackInput(e.target.value)}
                    placeholder="Scan barcode here..."
                    disabled={isPendingScanSORack}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-sky-400 hover:bg-sky-400/80 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingScanSORack || !SORackInput.trim()}
                >
                  {isPendingScanSORack ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "SO"
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div className="flex w-full bg-white rounded-md shadow p-5 gap-6 flex-col">
            <div className="w-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">List Rak</h3>
              <div className="flex items-center gap-3 w-full">
                <Input
                  className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                  value={searchRackInput}
                  onChange={(e) => {
                    setSearchRackInput(e.target.value);
                    setSearchRack(e.target.value);
                  }}
                  placeholder="Search..."
                  autoFocus
                />
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    onClick={() => refetchRacks()}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    variant={"outline"}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4",
                        isLoadingRacks || isRefetchRacks ? "animate-spin" : "",
                      )}
                    />
                  </Button>
                </TooltipProviderPage>
                <div className="flex gap-4 items-center ml-auto">
                  <TooltipProviderPage value={"Export Rack"} side="left">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleExportRack();
                      }}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black bg-sky-100 hover:bg-sky-200 disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                      disabled={isPendingExportRack}
                      variant={"outline"}
                    >
                      {isPendingExportRack ? (
                        <Loader2 className={cn("w-4 h-4 animate-spin")} />
                      ) : (
                        <FileDown className={cn("w-4 h-4")} />
                      )}
                    </Button>
                  </TooltipProviderPage>
                  <Button
                    onClick={() => setIsOpen("create-edit")}
                    className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    variant={"outline"}
                  >
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    Add Rack
                  </Button>
                  <Button
                    asChild
                    className="bg-sky-400 hover:bg-sky-400/80 text-black"
                  >
                    <Link href={`/stagging/rack/history`}>
                      <HistoryIcon className="w-4 h-4 ml-2" />
                      History Rack
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            {/* <div className="grid grid-cols-4 gap-4 w-full p-4">
              {searchValueRack ? (
                racksData?.data.filter((item: any) =>
                  (item.name ?? "")
                    .toLowerCase()
                    .includes((searchValueRack ?? "").toLowerCase())
                ).length > 0 ? (
                  racksData?.data
                    .filter((item: any) =>
                      (item.name ?? "")
                        .toLowerCase()
                        .includes((searchValueRack ?? "").toLowerCase())
                    )
                    .map((item: any, i: any) => (
                      <div
                        key={`${item.code_document_sale}-${i}`}
                        className="relative flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border"
                      >
                        <div className="flex w-full items-center gap-4">
                          <p className="text-sm font-bold text-black w-full">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex flex-col mt-2">
                          <p className="text-xs font-light text-gray-500">
                            Total Product
                          </p>
                          <p className="text-sm font-light text-gray-800">
                            {item.total_data}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end items-end sm:items-center">
                          <TooltipProviderPage value={<p>Detail</p>}>
                            <Button
                              className="items-center w-7 px-0 flex-none h-7 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                            >
                              <Link href={`/stagging/rack/details/2`}>
                                <ReceiptText className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TooltipProviderPage>

                          <TooltipProviderPage value={<p>Edit</p>}>
                            <Button
                              className="items-center w-7 px-0 flex-none h-7 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                              onClick={(e) => {
                                e.preventDefault();
                                setIsOpen("create-edit");
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </TooltipProviderPage>

                          <TooltipProviderPage value={<p>Delete</p>}>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(item.id);
                              }}
                              className="items-center w-7 px-0 flex-none h-7 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                              disabled={isPendingDelete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipProviderPage>
                          <TooltipProviderPage value={<p>To Display</p>}>
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(item.id);
                              }}
                              className="items-center w-7 px-0 flex-none h-7 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              variant={"outline"}
                              asChild
                              disabled={isPendingSubmit}
                            >
                              <Boxes className="w-4 h-4" />
                            </Button>
                          </TooltipProviderPage>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-500 border-b border-sky-200">
                    <div className="w-full flex-none text-center font-semibold">
                      No Data Viewed.
                    </div>
                  </div>
                )
              ) : racksData?.data.length > 0 ? (
                racksData?.data.map((item: any, i: any) => (
                  <div
                    key={`${item.code_document_sale}-${i}`}
                    className="relative flex w-full bg-white rounded-md overflow-hidden shadow p-5 justify-center flex-col border border-transparent transition-all hover:border-sky-300 box-border"
                  >
                    <div className="flex w-full items-center gap-4">
                      <p className="text-sm font-bold text-black w-full">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex flex-col mt-2">
                      <p className="text-xs font-light text-gray-500">
                        Total Product
                      </p>
                      <p className="text-sm font-light text-gray-800">
                        {item.total_data}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-end items-end sm:items-center">
                      <TooltipProviderPage value={<p>Detail</p>}>
                        <Button
                          className="items-center w-7 px-0 flex-none h-7 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                        >
                          <Link href={`/stagging/rack/details/${item.id}`}>
                            <ReceiptText className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipProviderPage>

                      <TooltipProviderPage value={<p>Edit</p>}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            setRackId(item.id);
                            setInput((prev) => ({
                              ...prev,
                              displayId:
                                item.display_rack_id ?? item.display?.id ?? "",
                              display: {
                                id: item.display_rack_id ?? item.display?.id ?? "",
                                name:
                                  item.display?.name ??
                                  item.name ??
                                  "",
                              },
                              name: item.name ?? prev.name,
                            }));
                            setIsOpen("create-edit");
                          }}
                          className="items-center w-7 px-0 flex-none h-7 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </TooltipProviderPage>

                      <TooltipProviderPage value={<p>Delete</p>}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(item.id);
                          }}
                          className="items-center w-7 px-0 flex-none h-7 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                          disabled={isPendingDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipProviderPage>
                      <TooltipProviderPage value={<p>To Display</p>}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubmit(item.id);
                          }}
                          className="items-center w-7 px-0 flex-none h-7 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                          variant={"outline"}
                          asChild
                          disabled={isPendingSubmit}
                        >
                          <Boxes className="w-4 h-4" />
                        </Button>
                      </TooltipProviderPage>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-500 border-b border-sky-200">
                  <div className="w-full flex-none text-center font-semibold">
                    No Data Viewed.
                  </div>
                </div>
              )}
            </div> */}
            <DataTable
              columns={columnRackStaging({
                metaPage,
                isLoadingRacks,
                isPendingSubmit,
                isPendingDelete,
                handleUpdate,
                handleDelete,
                handleSubmit,
                setRackId,
                setInput,
                setIsOpen,
                setSelectedBarcode,
                setSelectedNameRack,
                setSelectedTotalProduct,
                setBarcodeOpen,
                handleStockOpname,
                isPendingStockOpname,
              })}
              data={racksData?.data ?? []}
              isLoading={loading || isLoadingRacks || isRefetchRacks}
            />

            <div className="w-full p-4 bg-white">
              <Pagination
                pagination={{ ...metaPage, current: page }}
                setPagination={setPage}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="product" className="w-full gap-4 flex flex-col">
          {/* Card: SO Barang Disini */}
          <div className="bg-white shadow rounded-xl p-5 border border-gray-200 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">SO Barang Disini</h3>
            <form
              onSubmit={handleScanSOProduct}
              className="flex flex-col gap-3"
            >
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Scan Barcode
                  </label>
                  <Input
                    type="text"
                    className="border-sky-400/80 focus-visible:ring-sky-400"
                    value={SOProductInput}
                    onChange={(e) => setSOProductInput(e.target.value)}
                    placeholder="Scan barcode here..."
                    disabled={isPendingScanSO}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-sky-400 hover:bg-sky-400/80 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingScanSO || !SOProductInput.trim()}
                >
                  {isPendingScanSO ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "SO"
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
            <h2 className="text-xl font-bold">List Product Stagging</h2>
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-2 items-center w-full justify-between">
                <div className="flex items-center gap-3 w-full">
                  <Input
                    className="w-[250px] border-sky-400/80 focus-visible:ring-sky-400"
                    value={searchProductInput}
                    onChange={(e) => {
                      setSearchProductInput(e.target.value);
                      setSearchProduct(e.target.value);
                    }}
                    placeholder="Search..."
                  />
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetchProducts()}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                    >
                      <RefreshCw
                        className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                      />
                    </Button>
                  </TooltipProviderPage>
                  <div className="h-9 px-4 flex-none flex items-center text-sm rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                    Total:{" "}
                    <span className="font-semibold">
                      {metaPageProduct.total} Products
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TooltipProviderPage value={"Export Data"} side="left">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleExport();
                      }}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black bg-sky-100 hover:bg-sky-200 disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                      disabled={isPendingExport}
                      variant={"outline"}
                    >
                      {isPendingExport ? (
                        <Loader2 className={cn("w-4 h-4 animate-spin")} />
                      ) : (
                        <FileDown className={cn("w-4 h-4")} />
                      )}
                    </Button>
                  </TooltipProviderPage>
                  <Button
                    onClick={() => setIsOpen("filtered")}
                    className="bg-sky-400 hover:bg-sky-400/80 text-black"
                  >
                    Filtered Products
                    <ArrowRightCircle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              <DataTable
                columns={columnProductStaging({
                  metaPageProduct,
                  isLoadingProducts,
                  isPendingDryScrap,
                  handleAddFilter,
                  handleDryScrap,
                  handleMigrateToRepair,
                  isPendingMigrateToRepair,
                  setProductId,
                  setIsOpen,
                  setDamagedProductId,
                  setDamagedBarcode,
                  setIsOpenDamaged,
                  setSource,
                })}
                data={productData ?? []}
                isLoading={loading}
              />
              <Pagination
                pagination={{ ...metaPageProduct, current: pageProduct }}
                setPagination={setPageProduct}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
