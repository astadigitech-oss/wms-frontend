"use client";

import {
  ChevronRight,
  Edit3,
  Loader2,
  Minus,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListTagColorWMS } from "../_api/use-get-list-tag-color-wms";
import { useDeleteTagColor } from "../_api/use-delete-tag-color";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateTagColor } from "../_api/use-update-tag-color";
import { useGetDetailTagColor } from "../_api/use-get-detail-tag-color";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateTagColor } from "../_api/use-create-tag-color";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useGetListTagColorAPK } from "../_api/use-get-list-tag-color-apk";
import PickerColor from "@/components/picker-color";

export const Client = () => {
  const queryClient = useQueryClient();

  // type color APK || WMS
  const [isApk] = useQueryState(
    "apk",
    parseAsBoolean.withDefault(false)
  );

  // dialog edit
  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // color ID Edit
  const [colorId, setColorId] = useQueryState("colorId", {
    defaultValue: "",
  });

  // dialog pick color
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // input create edit
  const [newHex, setNewHex] = useState("#000000");
  const [input, setInput] = useState({
    name: "",
    fixPrice: "0",
    minPrice: "0",
    maxPrice: "0",
  });

  // search WMS
  const [dataSearchWMS, setDataSearchWMS] = useQueryState("q", {
    defaultValue: "",
  });
  const searchValueWMS = useDebounce(dataSearchWMS);

  // search APK
  const [dataSearchAPK, setDataSearchAPK] = useQueryState("q2", {
    defaultValue: "",
  });
  const searchValueAPK = useDebounce(dataSearchAPK);

  // dialog delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete Color ${isApk ? "APK" : "WMS"}`,
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteTagColor();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateTagColor();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateTagColor();

  // data WMS
  const {
    data: dataWMS,
    refetch: refetchWMS,
    isLoading: isLoadingWMS,
    isRefetching: isRefetchingWMS,
    isPending: isPendingWMS,
    error: errorWMS,
    isError: isErrorWMS,
  } = useGetListTagColorWMS({ q: searchValueWMS });

  // data APK
  const {
    data: dataAPK,
    refetch: refetchAPK,
    isLoading: isLoadingAPK,
    isRefetching: isRefetchingAPK,
    isPending: isPendingAPK,
    error: errorAPK,
    isError: isErrorAPK,
  } = useGetListTagColorAPK({ q: searchValueAPK });

  // data detail
  const {
    data: dataColor,
    isLoading: isLoadingColor,
    isSuccess: isSuccessColor,
    isError: isErrorColor,
    error: errorColor,
  } = useGetDetailTagColor({ id: colorId, isAPK: isApk });

  // data memo WMS
  const dataListWMS: any[] = useMemo(() => {
    return dataWMS?.data.data.resource;
  }, [dataWMS]);

  // data memo APK
  const dataListAPK: any[] = useMemo(() => {
    return dataAPK?.data.data.resource;
  }, [dataAPK]);

  // loading WMS APK
  const loadingWMS = isLoadingWMS || isRefetchingWMS || isPendingWMS;
  const loadingAPK = isLoadingAPK || isRefetchingAPK || isPendingAPK;

  useEffect(() => {
    alertError({
      isError: isErrorWMS,
      error: errorWMS as AxiosError,
      data: "Detail WMS",
      action: "get data",
      method: "GET",
    });
  }, [isErrorWMS, errorWMS]);

  useEffect(() => {
    alertError({
      isError: isErrorAPK,
      error: errorAPK as AxiosError,
      data: "Detail APK",
      action: "get data",
      method: "GET",
    });
  }, [isErrorAPK, errorAPK]);

  useEffect(() => {
    alertError({
      isError: isErrorColor,
      error: errorColor as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorColor, errorColor]);

  // handle delete color
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete(
      { id, isAPK: isApk },
      {
        onSuccess: (data) => {
          toast.success(`Color ${isApk ? "APK" : "WMS"} successfully deleted`);
          queryClient.invalidateQueries({
            queryKey: [isApk ? "list-tag-color-apk" : "list-tag-color-wms"],
          });
          queryClient.invalidateQueries({
            queryKey: ["tag-color-detail", data.data.data.resource.id, isApk],
          });
        },
        onError: (err) => {
          if (err.status === 403) {
            toast.error(`Error 403: Restricted Access`);
          } else {
            toast.error(
              `ERROR ${err?.status}: Color ${
                isApk ? "APK" : "WMS"
              } failed to delete`
            );
            console.log(`ERROR_COLOR_DELETED_${isApk ? "APK" : "WMS"}:`, err);
          }
        },
      }
    );
  };

  //  handle close
  const handleClose = () => {
    setOpenCreateEdit(false);
    setColorId("");
    setInput({
      name: "",
      fixPrice: "0",
      minPrice: "0",
      maxPrice: "0",
    });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      hexa_code_color: newHex,
      name_color: input.name,
      min_price_color: input.minPrice,
      max_price_color: input.maxPrice,
      fixed_price_color: input.fixPrice,
    };
    mutateCreate(
      {
        body,
        isAPK: isApk, // is apk color
      },
      {
        onSuccess: () => {
          handleClose();
          toast.success(`Color ${isApk ? "APK" : "WMS"} successfully created`);
          queryClient.invalidateQueries({
            queryKey: [isApk ? "list-tag-color-apk" : "list-tag-color-wms"],
          });
        },
        onError: (err) => {
          if (err.status === 403) {
            toast.error(`Error 403: Restricted Access`);
          } else {
            toast.error(
              `ERROR ${err?.status}: Color ${
                isApk ? "APK" : "WMS"
              } failed to create`
            );
            console.log(`ERROR_COLOR_CREATED_${isApk ? "APK" : "WMS"}:`, err);
          }
        },
      }
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      hexa_code_color: newHex,
      name_color: input.name,
      min_price_color: input.minPrice,
      max_price_color: input.maxPrice,
      fixed_price_color: input.fixPrice,
    };
    mutateUpdate(
      {
        id: colorId, // color ID
        body, // body
        isAPK: isApk, // isAPK
      },
      {
        onSuccess: (data) => {
          handleClose();
          toast.success(`Color ${isApk ? "APK" : "WMS"} successfully updated`);
          queryClient.invalidateQueries({
            queryKey: [isApk ? "list-tag-color-apk" : "list-tag-color-wms"],
          });
          queryClient.invalidateQueries({
            queryKey: ["tag-color-detail", data.data.data.resource.id, isApk],
          });
        },
        onError: (err) => {
          if (err.status === 403) {
            toast.error(`Error 403: Restricted Access`);
          } else {
            toast.error(
              `ERROR ${err?.status}: Color ${
                isApk ? "APK" : "WMS"
              } failed to update`
            );
            console.log(`ERROR_COLOR_UPDATED_${isApk ? "APK" : "WMS"}:`, err);
          }
        },
      }
    );
  };

  // set Input edit
  useEffect(() => {
    if (isSuccessColor && dataColor) {
      return () => {
        setInput({
          name: dataColor.data.data.resource.name_color,
          fixPrice: Math.round(
            dataColor.data.data.resource.fixed_price_color
          ).toString(),
          minPrice: Math.round(
            dataColor.data.data.resource.min_price_color
          ).toString(),
          maxPrice: Math.round(
            dataColor.data.data.resource.max_price_color
          ).toString(),
        });
        setNewHex(dataColor.data.data.resource.hexa_code_color);
      };
    }
  }, [dataColor]);

  // input isNaN
  useEffect(() => {
    if (isNaN(parseFloat(input.fixPrice))) {
      setInput((prev) => ({ ...prev, fixPrice: "0" }));
    }
    if (isNaN(parseFloat(input.maxPrice))) {
      setInput((prev) => ({ ...prev, maxPrice: "0" }));
    }
    if (isNaN(parseFloat(input.minPrice))) {
      setInput((prev) => ({ ...prev, minPrice: "0" }));
    }
  }, [input]);

  const columnTagColor: ColumnDef<any>[] = [
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
      accessorKey: "hexa_code_color",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TooltipProviderPage value={row.original.hexa_code_color}>
            <div
              className="size-5 rounded-md shadow border border-gray-500"
              style={{ background: row.original.hexa_code_color }}
            />
          </TooltipProviderPage>
        </div>
      ),
    },
    {
      accessorKey: "name_color",
      header: "Color Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.name_color}</div>
      ),
    },
    {
      accessorKey: "fixed_price_color",
      header: "Fixed Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.fixed_price_color)}
        </div>
      ),
    },
    {
      accessorKey: "min_price_color",
      header: () => <div className="text-center">Min. Price</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {formatRupiah(row.original.min_price_color)}
        </div>
      ),
    },
    {
      accessorKey: "-",
      header: () => <div className="text-center">-</div>,
      cell: () => <div className="text-center">-</div>,
    },
    {
      accessorKey: "max_price_color",
      header: () => <div className="text-center">Max. Price</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {formatRupiah(row.original.max_price_color)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isLoadingColor || isPendingUpdate || isPendingCreate}
              onClick={(e) => {
                e.preventDefault();
                setColorId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingColor || isPendingUpdate || isPendingCreate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
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

  if (
    (isErrorWMS && (errorWMS as AxiosError)?.status === 403) ||
    (isErrorAPK && (errorAPK as AxiosError)?.status === 403)
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
      <Tabs defaultValue={isApk ? "apk" : "wms"} className="w-full">
        <TabsContent value="wms">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>Setting Tag Color WMS</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TabsContent>
        <TabsContent value="apk">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>Setting Tag Color APK</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TabsContent>
        {/* <div className="flex w-full bg-sky-400 rounded overflow-hidden shadow-md px-5 py-3 justify-between items-center mb-4 mt-4 sticky top-5 z-10 border">
          <div className="flex items-center">
            <AlertCircle className="size-4 mr-2" />
            <p className="text-sm font-medium">Please select the type first</p>
          </div>
          <TabsList className="gap-4 bg-transparent">
            <TabsTrigger value="wms" asChild>
              <Button
                onClick={() => {
                  setDataSearchAPK("");
                  setDataSearchWMS("");
                  setIsApk(false);
                }}
                className="data-[state=active]:hover:bg-sky-100 data-[state=active]:bg-sky-200 bg-transparent hover:bg-sky-300 text-black shadow-none"
              >
                <Monitor className="size-4 mr-2" />
                WMS
              </Button>
            </TabsTrigger>
            <TabsTrigger value="apk" asChild>
              <Button
                onClick={() => {
                  setDataSearchAPK("");
                  setDataSearchWMS("");
                  setIsApk(true);
                }}
                className="data-[state=active]:hover:bg-sky-100 data-[state=active]:bg-sky-200 bg-transparent hover:bg-sky-300 text-black shadow-none"
              >
                <Smartphone className="size-4 mr-2" />
                APK
              </Button>
            </TabsTrigger>
          </TabsList>
        </div> */}
        <TabsContent value="wms">
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
            <h2 className="text-xl font-bold">List Tag Colors WMS</h2>
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-2 items-center w-full justify-between">
                <div className="flex items-center gap-3 w-full">
                  <Input
                    className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                    value={dataSearchWMS}
                    onChange={(e) => setDataSearchWMS(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                  />
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetchWMS()}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          loadingWMS ? "animate-spin" : ""
                        )}
                      />
                    </Button>
                  </TooltipProviderPage>
                  <div className="flex gap-4 items-center ml-auto">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenCreateEdit(true);
                      }}
                      disabled={
                        isLoadingColor || isPendingUpdate || isPendingCreate
                      }
                      className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                      variant={"outline"}
                    >
                      {isLoadingColor || isPendingUpdate || isPendingCreate ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <PlusCircle className={"w-4 h-4 mr-1"} />
                      )}
                      Add Color WMS
                    </Button>
                  </div>
                </div>
              </div>
              <DataTable columns={columnTagColor} data={dataListWMS ?? []} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="apk">
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
            <h2 className="text-xl font-bold">List Tag Colors APK</h2>
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-2 items-center w-full justify-between">
                <div className="flex items-center gap-3 w-full">
                  <Input
                    className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                    value={dataSearchAPK}
                    onChange={(e) => setDataSearchAPK(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                  />
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetchAPK()}
                      className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          loadingAPK ? "animate-spin" : ""
                        )}
                      />
                    </Button>
                  </TooltipProviderPage>
                  <div className="flex gap-4 items-center ml-auto">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenCreateEdit(true);
                      }}
                      disabled={
                        isLoadingColor || isPendingUpdate || isPendingCreate
                      }
                      className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                      variant={"outline"}
                    >
                      {isLoadingColor || isPendingUpdate || isPendingCreate ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <PlusCircle className={"w-4 h-4 mr-1"} />
                      )}
                      Add Color APK
                    </Button>
                  </div>
                </div>
              </div>
              <DataTable columns={columnTagColor} data={dataListAPK ?? []} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog
        open={openCreateEdit}
        onOpenChange={() => {
          handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {colorId ? "Edit Tag Color" : "Create Tag Color"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={colorId ? handleUpdate : handleCreate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Color Name</Label>
                <Dialog
                  modal={true}
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button className="text-black w-full flex items-center gap-3 p-1 border-b border-0 border-sky-400">
                      <div
                        style={{ background: newHex }}
                        className="w-9 flex-none rounded shadow h-9 border"
                      />
                      <div className="w-full flex items-center justify-center rounded h-9 text-sm font-medium ">
                        {newHex}
                      </div>
                      <div className="flex w-9 h-9 rounded flex-none items-center justify-center bg-sky-400">
                        <ChevronRight className="size-4" />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="p-3">
                    <DialogHeader>
                      <DialogTitle>Color Picker</DialogTitle>
                      <DialogDescription>
                        The color is autochange
                      </DialogDescription>
                    </DialogHeader>
                    <PickerColor
                      hexColor={newHex}
                      setHexColor={setNewHex}
                      isOpen={openCreateEdit}
                    />
                    <Button
                      className="bg-sky-400/80 hover:bg-sky-500 text-black"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Confirm
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Color Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Color name..."
                  value={input.name}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Fixed Price</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Rp 0"
                  value={input.fixPrice}
                  type="number"
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      fixPrice: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {formatRupiah(parseFloat(input.fixPrice)) ?? "Rp 0"}
                </p>
              </div>
              <div className="flex gap-2 items-center w-full">
                <div className="flex flex-col gap-1 w-full relative">
                  <Label>Min Price</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="Rp 0"
                    value={input.minPrice}
                    type="number"
                    // disabled={loadingSubmit}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        minPrice: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                  <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                    {formatRupiah(parseFloat(input.minPrice)) ?? "Rp 0"}
                  </p>
                </div>
                <Minus className="size-3" />
                <div className="flex flex-col gap-1 w-full relative">
                  <Label>Max Price</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="Rp 0"
                    value={input.maxPrice}
                    type="number"
                    // disabled={loadingSubmit}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        maxPrice: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                  <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                    {formatRupiah(parseFloat(input.maxPrice)) ?? "Rp 0"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  colorId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={!input.name || !newHex}
              >
                {colorId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
