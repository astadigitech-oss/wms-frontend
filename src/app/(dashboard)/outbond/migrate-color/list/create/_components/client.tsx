"use client";

import {
  ArrowLeft,
  ArrowLeftRight,
  Ban,
  CheckCircle2,
  Loader2,
  MapPinned,
  Minus,
  Palette,
  Plus,
  PlusCircle,
  RefreshCw,
  Send,
  Trash2,
  Triangle,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn } from "@/lib/utils";
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
import { useAddMigrateColor } from "../_api/use-add-migrate-color";
import { useSubmitMigrateColor } from "../_api/use-submit";
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

export const Client = () => {
  const [isOpenDestination, setIsOpenDestination] = useState(false);
  const [isOpenColor, setIsOpenColor] = useState(false);

  const [input, setInput] = useState({
    destination: "",
    color: "",
    count: 0,
    qty: "0",
  });

  const { mutate: mutateAddColor, isPending: isPendingAddColor } =
    useAddMigrateColor();
  const { mutate: mutateRemoveColor, isPending: isPendingRemoveColor } =
    useRemoveMigrateColor();
  const { mutate: mutateSubmit, isPending: isSubmit } = useSubmitMigrateColor();

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

  const dataList: any = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListDestination: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.destinations;
  }, [dataSelect]);

  const dataListColor: any[] = useMemo(() => {
    const colors = dataSelect?.data?.data?.resource?.color;

    if (!colors) return [];

    return Object.entries(colors).map(([name, value]: any) => ({
      name,
      qty: value.qty,
      fixed_price: value.fixed_price,
    }));
  }, [dataSelect]);

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

  const handleAddColor = () => {
    const body = {
      destiny_document_migrate: input.destination,
      product_color: input.color,
      product_total: input.qty,
    };
    mutateAddColor(
      { body },
      {
        onSuccess: () => {
          setInput({ destination: "", color: "", count: 0, qty: "0" });
        },
      },
    );
  };

  const handleRemoveColor = async (id: any) => {
    const ok = await confirmDeleteMigrate();

    if (!ok) return;

    mutateRemoveColor({ id });
  };

  const handleSubmit = async () => {
    mutateSubmit({});
  };

  // autoFill 0
  useEffect(() => {
    if (isNaN(parseFloat(input.qty)) || parseFloat(input.qty) < 0) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
    if (parseFloat(input.qty) > input.count) {
      setInput((prev) => ({ ...prev, qty: prev.count.toString() }));
    }
  }, [input]);

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
      accessorKey: "code_document_migrate",
      header: "Barcode",
    },
    {
      accessorKey: "product_color",
      header: "Color",
    },
    {
      accessorKey: "product_total",
      header: () => <div className="text-center">Total</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.product_total.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_price_product||old_price_product",
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
              disabled={isPendingAddColor || isSubmit || isPendingRemoveColor}
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
      <div className="col-span-2 bg-white px-5 py-3 rounded-md shadow w-full flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-gray-500 border-b">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-full flex items-center justify-center bg-sky-100 shadow">
              <MapPinned className="size-4" />
            </div>
            <h5 className="font-bold">Destination</h5>
          </div>
        </div>
        <Dialog open={isOpenDestination} onOpenChange={setIsOpenDestination}>
          <DialogTrigger asChild>
            <Button
              disabled={dataList?.destiny_document_migrate}
              className="bg-transparent h-10 text-base hover:bg-transparent text-black shadow-none justify-between group disabled:pointer-events-auto disabled:opacity-100 disabled:hover:bg-transparent"
            >
              {dataList?.destiny_document_migrate
                ? dataList?.destiny_document_migrate
                : input.destination
                  ? input.destination
                  : "Not Selected"}
              {!dataList?.destiny_document_migrate && (
                <div className="size-9 flex items-center justify-center rounded-full group-hover:bg-sky-100">
                  <ArrowLeftRight className="size-4" />
                </div>
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
                      onSelect={() => {
                        setInput((prev) => ({
                          ...prev,
                          destination: item.shop_name,
                        }));
                        setIsOpenDestination(false);
                      }}
                      className="py-2.5 px-3 capitalize"
                    >
                      <CheckCircle2
                        className={cn(
                          "fill-black stroke-white mr-2 w-5 h-5",
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
      <div className="col-span-3 bg-white px-5 py-3 rounded-md shadow w-full">
        <div className="flex items-center justify-between pb-3 mb-3 border-gray-500 border-b">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-full flex items-center justify-center bg-sky-100 shadow">
              <Palette className="size-4" />
            </div>
            <h5 className="font-bold">Color Product</h5>
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleAddColor();
            }}
            variant={"liquid"}
            disabled={
              (!input.destination && !dataList?.destiny_document_migrate) ||
              input.qty === "0"
            }
          >
            {isPendingAddColor ? (
              <>
                <Loader2 className="size-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (!input.destination && !dataList?.destiny_document_migrate) ||
              input.qty === "0" ? (
              <>
                <Ban className="size-3 mr-1" />
                Add
              </>
            ) : (
              <>
                <PlusCircle className="size-3 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        <div className="flex w-full items-center px-5 gap-4">
          <Dialog open={isOpenColor} onOpenChange={setIsOpenColor}>
            <DialogTrigger asChild>
              <Button
                disabled={
                  !input.destination && !dataList?.destiny_document_migrate
                }
                className="w-full bg-transparent h-10 text-base hover:bg-transparent text-black shadow-none justify-between group disabled:pointer-events-auto disabled:opacity-100 disabled:hover:bg-transparent"
              >
                {input.color ? (
                  <p>
                    {input.color}{" "}
                    <span className="text-gray-700 text-sm">
                      ({input.count} Products)
                    </span>
                  </p>
                ) : (
                  "Not Selected"
                )}
                {((input.destination && !dataList?.destiny_document_migrate) ||
                  (!input.destination &&
                    dataList?.destiny_document_migrate)) && (
                  <div className="size-9 flex items-center justify-center rounded-full group-hover:bg-sky-100">
                    <ArrowLeftRight className="size-4" />
                  </div>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="p-3">
              <DialogHeader>
                <DialogTitle>Select Color</DialogTitle>
              </DialogHeader>
              <Command>
                <CommandInput placeholder="Search color..." />
                <CommandList>
                  <CommandEmpty>No Color yet.</CommandEmpty>
                  <CommandGroup>
                    {/* {dataListColor?.map((item) => (
                      <CommandItem
                        key={item.name}
                        onSelect={() => {
                          setInput((prev) => ({
                            ...prev,
                            color: item.name,
                            count: item.value,
                          }));
                          setIsOpenColor(false);
                        }}
                        className="py-2.5 px-3 capitalize"
                      >
                        <CheckCircle2
                          className={cn(
                            "fill-black stroke-white mr-2 w-5 h-5",
                            input.color === item.name
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex justify-between items-center w-full">
                          <p className="font-semibold">{item.name}</p>
                          <p className="font-semibold">{item.name}</p>

                          <p className="text-xs">{item.value} Products</p>
                        </div>
                      </CommandItem>
                    ))} */}
                    {dataListColor?.map((item) => (
                      <CommandItem
                        key={item.name}
                        onSelect={() => {
                          setInput((prev) => ({
                            ...prev,
                            color: item.name,
                            count: item.qty, // ambil dari qty
                          }));
                          setIsOpenColor(false);
                        }}
                        className="py-2.5 px-3 capitalize"
                      >
                        <CheckCircle2
                          className={cn(
                            "fill-black stroke-white mr-2 w-5 h-5",
                            input.color === item.name
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />

                        <div className="flex justify-between items-center w-full">
                          <div className="flex flex-col">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.qty.toLocaleString()} Products
                            </p>
                          </div>

                          <p className="text-sm font-bold">
                            Rp {item.fixed_price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </DialogContent>
          </Dialog>
          <div className="flex items-center flex-none">
            <div className="flex h-10 relative items-center justify-center">
              <Triangle className="rotate-90 size-3 absolute mx-auto my-auto mt-0.5 fill-gray-500 stroke-none" />
              <div className="h-5 border-t-2 border-gray-500 w-5 mt-auto" />
            </div>
            <div className="size-9 flex items-center justify-center rounded-full border-gray-500 border-2">
              <Truck className="size-4" />
            </div>
            <div className="flex h-10 relative items-center justify-center">
              <Triangle className="rotate-90 size-3 absolute mx-auto my-auto mt-0.5 fill-gray-500 stroke-none" />
              <div className="h-5 border-t-2 border-gray-500 w-5 mt-auto" />
            </div>
          </div>
          <div className="w-2/5 flex-none flex relative items-center justify-center">
            <p className="text-sm font-semibold mr-3 pr-3 border-r border-black">
              Qty
            </p>
            <Input
              disabled={
                (!input.destination && !dataList?.destiny_document_migrate) ||
                !input.color
              }
              type="number"
              value={input.qty}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  qty: e.target.value.startsWith("0")
                    ? e.target.value.replace(/^0+/, "")
                    : e.target.value,
                }))
              }
              className="border-none focus-visible:ring-0 shadow-none placeholder:text-gray-500 px-0"
              placeholder="Total to be sent..."
            />
            <div className="flex items-center absolute right-0">
              <Button
                disabled={
                  parseFloat(input.qty) === 0 ||
                  (!input.destination && !dataList?.destiny_document_migrate) ||
                  !input.color
                }
                onClick={() =>
                  setInput((prev) => ({
                    ...prev,
                    qty: (parseFloat(prev.qty) - 1).toString(),
                  }))
                }
                className="bg-transparent p-0 size-9 rounded-full shadow-none hover:bg-sky-100 text-black"
              >
                <Minus className="size-4" />
              </Button>
              <Button
                disabled={
                  parseFloat(input.qty) === input.count ||
                  (!input.destination && !dataList?.destiny_document_migrate) ||
                  !input.color
                }
                onClick={() =>
                  setInput((prev) => ({
                    ...prev,
                    qty: (parseFloat(prev.qty) + 1).toString(),
                  }))
                }
                className="bg-transparent p-0 size-9 rounded-full shadow-none hover:bg-sky-100 text-black"
              >
                <Plus className="size-4" />
              </Button>
            </div>
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
          <DataTable
            columns={columnColorMigrate}
            data={dataList?.migrates ?? []}
            isLoading={
              isRefetching ||
              isSubmit ||
              isPendingAddColor ||
              isPendingRemoveColor
            }
          />
        </div>
      </div>
    </div>
  );
};
