"use client";

import { useQueryState, parseAsString } from "nuqs";
import { XCircle, RefreshCw, CircleFadingPlus } from "lucide-react";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn } from "@/lib/utils";

import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { columnNotification } from "./columns";
import { DialogDetailSale } from "./dialogs/dialog-detail-sale";

import { useGetDetailApprove } from "../_api/use-get-detail-approve";
import { useGetListNotification } from "../_api/use-get-list-notification";
import { usePagination } from "@/lib/pagination";
import { DialogDetailProduct } from "./dialogs/dialog-detail-product";
import { DialogDetailPalet } from "./dialogs/dialog-detail-palet";
import { useGetDetailApprovePalet } from "../_api/use-get-detail-approve-palet";
import { useSearchQuery } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { useGetDetailApproveMI } from "../_api/use-get-detail-approve-mi";
import { DialogDetailProductManualInbound } from "./dialogs/dialog-detail-product-manual-inbound";
import { DialogDetailProductPendingApproval } from "./dialogs/dialog-detail-product-pending-approval";
import { useGetDetailPendingApproval } from "../_api/use-get-detail-pending-approval";

export const Client = () => {
  const [isStatus, setIsStatus] = useState(false);
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );

  // data search, page
  const [saleId, setSaleId] = useQueryState(
    "saleId",
    parseAsString.withDefault(""),
  );
  const [miId, setMiId] = useQueryState("miId", parseAsString.withDefault(""));
  // data search, page
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );

  const [userId, setUserId] = useQueryState(
    "userId",
    parseAsString.withDefault(""),
  );

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, setPage, metaPage, setPagination } = usePagination("p");

  // get data utama
  const { data, refetch, isLoading, isRefetching, error, isError, isSuccess } =
    useGetListNotification({ p: page, q: status, search: searchValue });

  const dataDetail = useGetDetailApprove({ id: saleId, status: openDialog });
  const dataDetailPalet = useGetDetailApprovePalet({ id: userId });
  const dataDetailMI = useGetDetailApproveMI({
    id: openDialog === "manual_inbound" ? miId : "",
  });
  const dataDetailPendingApproval = useGetDetailPendingApproval({
    id: openDialog === "pending_approval" ? miId : "",
  });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching;

  // get pagetination
  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // loading
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
      <DialogDetailSale
        open={openDialog === "sale"} // open modal
        onCloseModal={() => {
          if (openDialog === "sale") {
            setOpenDialog("");
            setSaleId("");
          }
        }}
        saleId={saleId}
        setSaleId={setSaleId}
        baseData={dataDetail}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
      <DialogDetailProduct
        open={openDialog === "inventory" || openDialog === "staging"} // open modal
        onCloseModal={() => {
          if (openDialog === "inventory" || openDialog === "staging") {
            setOpenDialog("");
            setSaleId("");
          }
        }}
        saleId={saleId}
        setSaleId={setSaleId}
        baseData={dataDetail}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
      <DialogDetailPalet
        open={openDialog === "palet"}
        onCloseModal={() => {
          if (openDialog === "palet") {
            setOpenDialog("");
            setUserId("");
          }
        }}
        userId={userId}
        baseData={dataDetailPalet}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
      <DialogDetailProductManualInbound
        open={openDialog === "manual_inbound"} // open modal
        onCloseModal={() => {
          if (openDialog === "manual_inbound") {
            setOpenDialog("");
            setMiId("");
          }
        }}
        miId={miId}
        setmiId={setMiId}
        baseData={dataDetailMI}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
        <DialogDetailProductPendingApproval
        open={openDialog === "pending_approval"} // open modal
        onCloseModal={() => {
          if (openDialog === "pending_approval") {
            setOpenDialog("");
            setMiId("");
          }
        }}
        miId={miId}
        setmiId={setMiId}
        baseData={dataDetailPendingApproval}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Notification</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Notification</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
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
              <div className="flex items-center gap-3">
                <Popover open={isStatus} onOpenChange={setIsStatus}>
                  <PopoverTrigger asChild>
                    <Button className="border-sky-400/80 border text-black bg-transparent border-dashed hover:bg-transparent flex px-3 hover:border-sky-400">
                      <CircleFadingPlus className="h-4 w-4 mr-2" />
                      Status
                      {status && (
                        <Separator
                          orientation="vertical"
                          className="mx-2 bg-gray-500 w-[1.5px]"
                        />
                      )}
                      {status && (
                        <Badge
                          className={cn(
                            "rounded w-20 px-0 justify-center text-black font-normal capitalize",
                            status === "pending" &&
                              "bg-yellow-300 hover:bg-yellow-300",
                            status === "display" &&
                              "bg-sky-400 hover:bg-sky-400",
                            status === "done" &&
                              "bg-green-400 hover:bg-green-400",
                            status === "sale" &&
                              "bg-indigo-400 hover:bg-indigo-400 text-white",
                            status === "inventory" &&
                              "bg-amber-700 hover:bg-amber-700 text-white",
                            status === "staging" &&
                              "bg-rose-300 hover:bg-rose-300",
                            status === "palet" &&
                              "bg-purple-500 hover:bg-purple-500 text-white",
                            status === "manual_inbound" &&
                              "bg-red-400 hover:bg-red-400 text-white",
                              status === "pending_approval" &&
                              "bg-emerald-600 hover:bg-emerald-600 text-white",
                          )}
                        >
                          {status}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-52" align="start">
                    <Command>
                      <CommandGroup>
                        <CommandList>
                          <CommandItem
                            onSelect={() => {
                              setStatus("pending");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "pending"}
                              onCheckedChange={() => {
                                setStatus("pending");
                                setIsStatus(false);
                              }}
                            />
                            Pending
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("display");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "display"}
                              onCheckedChange={() => {
                                setStatus("display");
                                setIsStatus(false);
                              }}
                            />
                            Display
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("done");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "done"}
                              onCheckedChange={() => {
                                setStatus("done");
                                setIsStatus(false);
                              }}
                            />
                            Done
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("sale");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "sale"}
                              onCheckedChange={() => {
                                setStatus("sale");
                                setIsStatus(false);
                              }}
                            />
                            Sale
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("inventory");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "inventory"}
                              onCheckedChange={() => {
                                setStatus("inventory");
                                setIsStatus(false);
                              }}
                            />
                            Inventory
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("staging");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "staging"}
                              onCheckedChange={() => {
                                setStatus("staging");
                                setIsStatus(false);
                              }}
                            />
                            Staging
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("palet");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "palet"}
                              onCheckedChange={() => {
                                setStatus("palet");
                                setIsStatus(false);
                              }}
                            />
                            Palet
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("manual_inbound");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "manual_inbound"}
                              onCheckedChange={() => {
                                setStatus("manual_inbound");
                                setIsStatus(false);
                              }}
                            />
                            Manual Inbound
                          </CommandItem>
                           <CommandItem
                            onSelect={() => {
                              setStatus("pending_approval");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "pending_approval"}
                              onCheckedChange={() => {
                                setStatus("pending_approval");
                                setIsStatus(false);
                              }}
                            />
                            Pending Approval
                          </CommandItem>
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {status && (
                  <Button
                    variant={"ghost"}
                    className="flex px-3"
                    onClick={() => setStatus("")}
                  >
                    Reset
                    <XCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DataTable
            columns={columnNotification({
              metaPage,
              setSaleId,
              setOpenDialog,
              setUserId,
              setMiId,
              isLoading: dataDetail.isLoading,
            })}
            data={dataList ?? []}
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
