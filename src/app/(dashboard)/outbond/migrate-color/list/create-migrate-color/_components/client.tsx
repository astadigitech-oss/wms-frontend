"use client";

import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetListColorMigrate } from "../_api/use-get-list-color-migrate-color";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetSelect } from "../_api/use-get-select";
import { useSubmitMigrateColor } from "../_api/use-submit";
import { useGetListRackMigrateToPos } from "../_api/use-get-list-rack-migrate-to-pos";
import { useAddRackMigrate } from "../_api/use-add-rack-migrate";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRemoveMigrateColor } from "../_api/use-remove-migrate-color";
import { useConfirm } from "@/hooks/use-confirm";
import { Label } from "@radix-ui/react-label";
import { useDebounce } from "@/hooks/use-debounce";

const DialogRack = dynamic(() => import("./dialog-rack"), {
  ssr: false,
});

export const Client = () => {
  const [isOpenDestination, setIsOpenDestination] = useState(false);
  const [isOpenRack, setIsOpenRack] = useState(false);

  const [input, setInput] = useState({
    destination: "",
    barcode: "",
  });

  const [rackSearch, setRackSearch] = useState("");
  const [rackPage, setRackPage] = useState(1);
  const searchRackValue = useDebounce(rackSearch);

  const { mutate: mutateRemoveColor, isPending: isPendingRemoveColor } =
    useRemoveMigrateColor();
  const { mutate: mutateSubmit, isPending: isSubmit } = useSubmitMigrateColor();
  const { mutate: mutateAddRack } = useAddRackMigrate();

  const [DeleteMigrateDialog, confirmDeleteMigrate] = useConfirm(
    "Delete Migrate",
    "This action cannot be undone",
    "destructive",
  );

  const { data, refetch, isRefetching, error, isError } =
    useGetListColorMigrate();

  const {
    data: dataSelect,
    // refetch: refetchFiltered,
    isError: isErrorSelect,
    error: errorSelect,
  } = useGetSelect();

  const {
    data: dataRack,
    refetch: refetchRack,
    isRefetching: isRefetchingRack,
  } = useGetListRackMigrateToPos({ p: rackPage, q: searchRackValue });

  const dataList: any = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListDestination: any[] = useMemo(() => {
    const destinations = dataSelect?.data?.data?.resource?.destinations;
    return destinations ?? [];
  }, [dataSelect]);

  const dataListRack: any[] = useMemo(() => {
    return dataRack?.data?.data?.resource?.data ?? [];
  }, [dataRack]);

  const metaPageRack: any = useMemo(() => {
    const resource = dataRack?.data?.data?.resource;
    return {
      current: resource?.current_page ?? 1,
      last: resource?.last_page ?? 1,
      from: resource?.from ?? 0,
      total: resource?.total ?? 0,
      perPage: resource?.per_page ?? 10,
    };
  }, [dataRack]);

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
      isError: isErrorSelect,
      error: errorSelect as AxiosError,
      data: "Select Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorSelect, errorSelect]);

  useEffect(() => {
    if (dataList?.destiny_document_migrate) {
      setInput((prev) => ({
        ...prev,
        destination: dataList.destiny_document_migrate,
      }));
    }
  }, [dataList?.destiny_document_migrate]);

  const handleAddRack = (barcode?: string) => {
    const targetBarcode = barcode ?? input.barcode;
    const body = {
      barcode: targetBarcode,
      destiny_document_migrate: input.destination,
    };
    mutateAddRack(body, {
      onSuccess: () => {
        setInput((prev) => ({ ...prev, barcode: "" }));
        setRackSearch("");
      },
    });
  };

  const handleSelectRack = (rack: any) => {
    setInput((prev) => ({ ...prev, barcode: rack.barcode }));
    handleAddRack(rack.barcode);
    setIsOpenRack(false);
  };

  const handleRemoveColor = async (id: any) => {
    const ok = await confirmDeleteMigrate();

    if (!ok) return;

    mutateRemoveColor({ id });
  };

  const handleSubmit = async () => {
    mutateSubmit({});
  };

  const columnColorMigrate: ColumnDef<any>[] = [
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
      accessorKey: "rack_barcode",
      header: "Rack Barcode",
    },
    {
      accessorKey: "rack_name",
      header: "Name Rack",
    },
    {
      accessorKey: "total_qty_in_rack",
      header: () => <div className="text-center">Total</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {(row.original.total_qty_in_rack ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_new_price_rack",
      header: "Total Price",
      cell: ({ row }) => formatRupiah(row.original.total_new_price_rack ?? 0),
    },
    {
      accessorKey: "status_migrate",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Badge className="bg-gray-300 hover:bg-gray-300 text-black capitalize rounded">
            {row.original.status_migrate}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Remove</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isSubmit || isPendingRemoveColor}
              onClick={(e) => {
                e.preventDefault();
                handleRemoveColor(row.original.id);
              }}
            >
              {isPendingRemoveColor ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const columnRack: ColumnDef<any>[] = [
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
      accessorKey: "barcode",
      header: "Rack Barcode",
    },
    {
      accessorKey: "name",
      header: "Name Rack",
    },
    {
      accessorKey: "total_items",
      header: () => <div className="text-center">Total Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {(row.original.total_items ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_new_price",
      header: "Total Price",
      cell: ({ row }) => formatRupiah(row.original.total_new_price ?? 0),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Add Rack"}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleSelectRack(row.original);
              }}
            >
              <PlusCircle className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
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

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteMigrateDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/migrate-color/list">
              Migrate Color
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
        <Link href="/outbond/migrate-color/list">
          <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Migrate</h1>
      </div>
      <div className="w-full bg-white px-5 py-4 rounded-md shadow flex flex-col gap-4">
        {/* Header */}
        <div className="pb-3 border-b border-gray-500">
          <div className="flex items-center gap-4">
            {/* <div className="size-8 rounded-full flex items-center justify-center bg-sky-100 shadow">
              <Scan className="size-4" />
            </div> */}
            <h5 className="font-bold">Description</h5>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-4 items-end">
          {/* Destination */}
          <div className="flex-1">
            <Dialog
              open={isOpenDestination}
              onOpenChange={setIsOpenDestination}
            >
              <DialogTrigger asChild>
                <Button
                  disabled={dataList?.destiny_document_migrate}
                  className="w-full h-10 text-base bg-transparent text-black border border-gray-300 shadow-none justify-between 
            hover:bg-transparent disabled:pointer-events-auto disabled:opacity-100 disabled:hover:bg-transparent"
                >
                  <span className="text-gray-600">
                    {dataList?.destiny_document_migrate
                      ? dataList.destiny_document_migrate
                      : input.destination || "Pilih Toko"}
                  </span>

                  {!dataList?.destiny_document_migrate && (
                    <ArrowLeftRight className="size-4" />
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="p-3">
                <DialogHeader>
                  <DialogTitle>Select Destination</DialogTitle>
                </DialogHeader>

                <Command>
                  <CommandInput placeholder="Search destination..." />

                  <CommandList>
                    <CommandEmpty>No Destination yet.</CommandEmpty>

                    <CommandGroup>
                      {dataListDestination?.map((item) => (
                        <CommandItem
                          key={item.id}
                          className="py-2.5 px-3 capitalize"
                          onSelect={() => {
                            setInput((prev) => ({
                              ...prev,
                              destination: item.shop_name,
                            }));
                            setIsOpenDestination(false);
                          }}
                        >
                          <CheckCircle2
                            className={cn(
                              "mr-2 w-5 h-5 fill-black stroke-white",
                              input.destination === item.shop_name
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />

                          <div className="flex flex-col">
                            <p className="font-semibold">{item.shop_name}</p>
                            <p className="text-xs">{item.alamat}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          </div>

          {/* Total Price */}
          <div className="flex-1">
            <Input
              disabled
              value={formatRupiah(dataList?.total_display_price ?? 0)}
              placeholder="Total Price :"
              className="w-full h-10 text-base bg-transparent text-black border border-gray-300 shadow-none 
        hover:bg-transparent disabled:pointer-events-auto disabled:opacity-100 disabled:hover:bg-transparent"
            />
          </div>

          {/* Qty */}
          <div className="flex-1">
            <Input
              disabled
              value={dataList?.total_display_qty ?? ""}
              placeholder="Qty :"
              className="w-full h-10 text-base bg-transparent text-black border border-gray-300 shadow-none 
        hover:bg-transparent disabled:pointer-events-auto disabled:opacity-100 disabled:hover:bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex flex-col w-full gap-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-gray-500 border-b">
            <div className="flex items-center gap-4">
              <h5 className="font-bold">List Color Filtered</h5>
            </div>

            <div className="flex gap-4 items-center">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : "",
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <Button
                variant={"liquid"}
                disabled={dataList?.migrates === 0}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                {isSubmit ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4 mr-1" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex w-full items-center gap-3">
            <div className="flex-1 bg-white rounded-md shadow p-3 relative">
              <div
                className={cn(
                  "w-full flex justify-between items-center relative group",
                  "cursor-not-allowed",
                )}
              >
                <Label
                  htmlFor="rack-search"
                  className="flex gap-2 absolute left-2 items-center"
                >
                  <Badge className="bg-black text-xs rounded-full text-white">
                    Add Rack
                  </Badge>
                </Label>
                <Input
                  id="rack-search"
                  className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100"
                  placeholder="Search rack..."
                  value={rackSearch}
                  onChange={(e) => setRackSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (rackSearch.trim()) {
                        handleAddRack(rackSearch.trim());
                      } else {
                        setIsOpenRack(true);
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (rackSearch.trim()) {
                      handleAddRack(rackSearch.trim());
                    } else {
                      setIsOpenRack(true);
                    }
                  }}
                  className="bg-sky-300/80 w-10 p-0 hover:bg-sky-300 text-black rounded-l-none border border-sky-300/80 hover:border-sky-300 focus-visible:ring-0 disabled:opacity-100"
                >
                  <Search className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <DialogRack
            open={isOpenRack}
            onCloseModal={() => setIsOpenRack(false)}
            search={rackSearch}
            setSearch={setRackSearch}
            refetch={refetchRack}
            isRefetching={isRefetchingRack}
            columns={columnRack}
            dataTable={dataListRack}
            page={rackPage}
            metaPage={metaPageRack}
            setPage={setRackPage}
          />
          <DataTable
            columns={columnColorMigrate}
            data={dataList?.migrates ?? []}
            isLoading={isRefetching || isSubmit || isPendingRemoveColor}
          />
        </div>
      </div>
    </div>
  );
};
