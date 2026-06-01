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
  ArrowLeftRight,
  ArrowRightCircle,
  Check,
  Copy,
  FileSpreadsheet,
  RefreshCw,
  ScanLine,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useGetDetailManifestInbound } from "../_api/use-get-detail-manifest-inbound";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Pagination from "@/components/pagination";
import { notFound, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProductMI } from "../_api/use-delete-product-mi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateEditBarcodeMI } from "../_api/use-create-edit-barcode-mi";
import { useDeleteBarcodeMI } from "../_api/use-delete-barcode-mi";
import Loading from "../../../../../../../../loading";
import { useGetScanManifestInbound } from "../_api/use-get-scan-manifest-inbound";
import dynamic from "next/dynamic";

const DialogDetail = dynamic(() => import("../_components/dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const { miId, miMonth, miYear } = useParams();
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );

  const [cEBarcode, setCEBarcode] = useQueryState(
    "create-edit-barcode",
    parseAsBoolean.withDefault(false),
  );

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);

  const codeDocument = `${miId}/${miMonth}/${miYear}`;

  const { mutate: mutateDeleteBarcode } = useDeleteBarcodeMI();
  const { mutate: mutateDelete } = useDeleteProductMI();
  const { mutate: mutateCE } = useCreateEditBarcodeMI();
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive",
  );
  const [DeleteBarcodeDialog, confirmBarcodeDelete] = useConfirm(
    "Delete Barcode",
    "This action cannot be undone",
    "destructive",
  );

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const {
    data,
    error,
    refetch,
    isError,
    isPending,
    isRefetching,
    isLoading,
    isSuccess,
  } = useGetDetailManifestInbound({
    code: codeDocument,
    p: page,
    q: searchValue,
  });

  const {
    data: dataScan,
    error: errorScan,
    refetch: refetchScan,
    isError: isErrorScan,
    isRefetching: isRefetchingScan,
  } = useGetScanManifestInbound({
    code: codeDocument,
  });

  const loading = isPending || isRefetching || isLoading;

  const dataMetaDetailMI = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataDetailMI = useMemo(() => {
    return data?.data.data.resource.data.data;
  }, [data]);

  const dataScanMI: any = useMemo(() => {
    return dataScan?.data.data.resource.summary;
  }, [dataScan]);

  const dataUserScanMI: any[] = useMemo(() => {
    return dataScan?.data.data.resource.data;
  }, [dataScan]);

  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource.data,
      setPage,
      setMetaPage,
    });
  }, [data]);
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);
  useEffect(() => {
    alertError({
      isError: isErrorScan,
      error: errorScan as AxiosError,
      data: "Data Scan",
      action: "get data",
      method: "GET",
    });
  }, [isErrorScan, errorScan]);

  useEffect(() => {
    if (isSuccess && data && cEBarcode) {
      setInput(data?.data.data.resource.custom_barcode ?? "");
    }
  }, [cEBarcode]);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;
    mutateDelete({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["detail-manifest-inbound", codeDocument],
        });
      },
    });
  };

  const handleDeleteBarcode = async () => {
    const ok = await confirmBarcodeDelete();

    if (!ok) return;

    mutateDeleteBarcode(
      { code_document: codeDocument },
      {
        onSuccess: () => {
          setCEBarcode(false);
          setInput("");
          queryClient.invalidateQueries({
            queryKey: ["detail-manifest-inbound", codeDocument],
          });
        },
      },
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutateCE(
      {
        code_document: codeDocument,
        init_barcode: input,
      },
      {
        onSuccess: () => {
          setCEBarcode(false);
          setInput("");
          queryClient.invalidateQueries({
            queryKey: ["detail-manifest-inbound", codeDocument],
          });
        },
      },
    );
  };

  const columnDetailManifestInbound: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_barcode_product",
      header: "Barcode",
      cell: ({ row }) => (
        <div className="flex items-center">
          <p>{row.original.old_barcode_product}</p>
          <TooltipProviderPage
            value={<p>{copied === row.index ? "Copied" : "Copy Barcode"}</p>}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                handleCopy(row.original.old_barcode_product, row.index);
              }}
              disabled={copied === row.index}
            >
              {copied === row.index ? (
                <Check className="w-3 h-3 ml-2" />
              ) : (
                <Copy className="w-3 h-3 ml-2" />
              )}
            </button>
          </TooltipProviderPage>
        </div>
      ),
    },
    {
      accessorKey: "old_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">
          {row.original.old_name_product}
        </div>
      ),
    },
    {
      accessorKey: "old_quantity_product",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {Math.round(row.original.old_quantity_product).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_price_product",
      header: "Total Items",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.old_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value="Delete">
            <Button
              className="items-center px-0  border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 w-9"
              variant={"outline"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];
  const columnUserScan: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "User Name",
    },
    {
      accessorKey: "total_scans",
      header: () => <div className="text-center">Total Scan</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.total_scans}</div>
      ),
    },
    {
      accessorKey: "scan_date",
      header: "Date",
    },
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }
  if (isError && (error as AxiosError)?.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteDialog />
      <DeleteBarcodeDialog />
      <DialogDetail
        open={openDetail} // open modal
        onCloseModal={() => {
          if (openDetail) {
            setOpenDetail(false);
          }
        }} // handle close modal
        data={dataScanMI}
        refetch={refetchScan}
        isRefetching={isRefetchingScan}
        columns={columnUserScan}
        dataTable={dataUserScanMI ?? []}
      />
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
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex text-sm text-gray-500 py-8 rounded-md shadow bg-white w-full px-5">
        <div className="w-full text-xs flex items-center">
          <Link
            href={"/inbound/check-product/manifest-inbound"}
            className="group"
          >
            <button
              type="button"
              className="flex items-center text-black group-hover:mr-6 mr-4 transition-all w-auto"
            >
              <div className="w-10 h-10 rounded-full group-hover:shadow justify-center flex items-center group-hover:bg-gray-100 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </button>
          </Link>
          <div className="w-2/3">
            <p>Data Name</p>
            <TooltipProviderPage value={dataMetaDetailMI?.document_name}>
              <h3 className="text-black font-semibold text-xl">
                {dataMetaDetailMI?.document_name}
              </h3>
            </TooltipProviderPage>
          </div>
        </div>
        <div className="flex w-full">
          <div className="flex flex-col items-end w-1/5 border-r border-gray-500 pr-5 mr-5">
            <p className="text-sm font-medium">Status</p>
            <h3 className="text-gray-700 font-light capitalize whitespace-nowrap">
              {dataMetaDetailMI?.status}
            </h3>
          </div>
          <div className="flex flex-col items-end w-2/5 border-r border-gray-700 pr-5 mr-5">
            <p className="text-sm font-medium">Merged Data</p>
            <h3 className="text-gray-700 font-light capitalize">
              {dataMetaDetailMI?.code_document}
            </h3>
          </div>
          <div className="flex flex-col items-end w-1/5 border-r border-gray-700 pr-5 mr-5">
            <p className="text-sm font-medium">Total</p>
            <h3 className="text-gray-700 font-light capitalize">
              {dataMetaDetailMI?.total_columns.toLocaleString()}
            </h3>
          </div>
          <div className="flex flex-col items-end w-auto">
            <Dialog open={cEBarcode} onOpenChange={setCEBarcode}>
              <DialogTrigger asChild>
                <button className="text-sm gap-3 font-medium flex items-center hover:bg-sky-100 rounded pr-2 pl-3  text-sky-700 focus-visible:outline-none focus-visible:ring-0 group border border-sky-400">
                  <div className="flex flex-col">
                    <p className="underline">Barcode</p>
                    <h3 className="text-gray-700 font-light text-end">
                      {dataMetaDetailMI?.custom_barcode ?? "-"}
                    </h3>
                  </div>
                  <div className="flex items-center justify-center size-6 bg-sky-100 group-hover:bg-sky-200 hover:bg-sky-200 rounded-full border border-sky-700">
                    <ArrowLeftRight className="w-3 h-3" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {dataMetaDetailMI?.custom_barcode ? "Edit" : "Create"}{" "}
                    Barcode
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="w-full flex flex-col gap-3">
                    <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
                      <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Base Document
                      </div>
                      <h5 className="pl-6 text-sm">
                        {dataMetaDetailMI?.code_document}
                      </h5>
                    </div>
                    <div className="flex w-full flex-col gap-1">
                      <Label htmlFor="customBarcode">Custom Barcode</Label>
                      <div className="flex w-full gap-2">
                        <Input
                          id="customBarcode"
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Custom Barcode..."
                        />
                        {dataMetaDetailMI?.custom_barcode && (
                          <Button
                            size={"icon"}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteBarcode();
                            }}
                            className="bg-red-50 hover:bg-red-100 border border-red-500 text-red-500 flex-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full gap-2">
                    <Button
                      className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                      onClick={() => {
                        setCEBarcode(false);
                        setInput("");
                      }}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                      type="submit"
                    >
                      Update
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">Detail Data Process</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex w-full justify-between">
            <div className="flex gap-2 items-center w-full flex-auto">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400 flex-none"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
              />
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
              <div className="flex items-center justify-end w-full gap-3">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDetail(true);
                  }}
                  className="hover:bg-sky-100 border-sky-400 hover:border-sky-500 text-black"
                  variant={"outline"}
                >
                  <ScanLine className="w-4 h-4 mr-1" />
                  Detail Scan
                </Button>
                <Button
                  asChild
                  type="button"
                  onClick={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["check-manifest-inbound", codeDocument],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["check-categories-manifest-inbound"],
                    });
                  }}
                  className="bg-sky-400/80 hover:bg-sky-400 text-black"
                >
                  <Link
                    href={`/inbound/check-product/manifest-inbound/${codeDocument}/check-v2`}
                  >
                    <ArrowRightCircle className="w-4 h-4 mr-1" />
                    Next
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable
            columns={columnDetailManifestInbound}
            data={dataDetailMI ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
