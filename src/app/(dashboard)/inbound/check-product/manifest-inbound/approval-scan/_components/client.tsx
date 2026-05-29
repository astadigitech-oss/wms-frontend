"use client";

import Loading from "@/app/(dashboard)/loading";
import Forbidden from "@/components/403";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { alertError, cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleFadingPlus,
  Loader,
  Loader2,
  RefreshCw,
  ScanBarcode,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetApprovalBast } from "../_api/use-get-approval-bast";
import { useActionApprovalBast } from "../_api/use-action-approval-bast";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";

const getApprovalList = (data: any): any[] => {
  const resource = data?.data.data.resource;

  if (Array.isArray(resource)) return resource;
  if (Array.isArray(resource?.data)) return resource.data;
  if (Array.isArray(resource?.resource)) return resource.resource;

  return [];
};

const getStatus = (item: any) =>
  String(item.approval_status ?? item.status ?? item.approved ?? "pending")
    .toLowerCase()
    .replaceAll("_", " ");

const NodeForm = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col gap-1 w-full">
    <Label className="text-xs">{label}</Label>
    <Input
      disabled
      value={value ?? "-"}
      className="disabled:opacity-100 border-sky-400/80"
    />
  </div>
);

const ApprovalDetailDialog = ({
  open,
  item,
  loading,
  onClose,
  onAction,
}: {
  open: boolean;
  item: any;
  loading: boolean;
  onClose: () => void;
  onAction: (id: string, action: "approve" | "reject") => void;
}) => {
  const currentStatus = getStatus(item ?? {});
  const isDone = currentStatus === "approved" || currentStatus === "rejected";
  const sourceId = item?.source_id ?? item?.id_asal ?? "-";
  const barcode = item?.barcode_old_product ?? item?.old_barcode_product ?? "-";
  const editedName = item?.edited_name ?? item?.edited_name_product ?? "-";
  const editedQty = item?.edited_qty ?? item?.edited_quantity_product ?? "-";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClose={false}
        className="min-w-[75vw]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Detail Perbandingan Data Untuk Approval
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>

        {!item ? (
          <div className="w-full h-[60vh] flex justify-center items-center">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="border border-sky-400/80 rounded-md p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-3">
                  <ScanBarcode className="size-4" />
                  <p className="font-semibold text-lg">
                    {barcode !== "-" ? barcode : `Source ID: ${sourceId}`}
                  </p>
                  <Badge className="bg-yellow-300 hover:bg-yellow-300 text-black font-normal capitalize">
                    {currentStatus}
                  </Badge>
                </div>

                <div className="flex gap-3">
                 
                  {!isDone && (
                    <>
                      <Button
                        className="bg-sky-400/80 hover:bg-sky-400 text-black"
                        size="sm"
                        disabled={loading}
                        onClick={() => onAction(String(item.id), "approve")}
                      >
                        <CheckCircle2 className="size-4 mr-1" />
                        Approve
                      </Button>

                      <Button
                        className="bg-red-400/80 hover:bg-red-400 text-black"
                        size="sm"
                        disabled={loading}
                        onClick={() => onAction(String(item.id), "reject")}
                      >
                        <XCircle className="size-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-4 w-full">
                  <h3 className="w-full text-center font-semibold text-lg py-2 bg-sky-100 border-b border-sky-300">
                    Old Data
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <NodeForm label="Source ID" value={sourceId} />
                    <NodeForm
                      label="Product Name"
                      value={item.old_name_product}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <NodeForm label="Qty" value={item.old_quantity_product} />
                      <NodeForm label="Editor" value={item.editor_name} />
                    </div>
                  </div>
                </div>

                <div className="h-full bg-sky-400/20 w-px" />

                <div className="flex flex-col gap-4 w-full">
                  <h3 className="w-full text-center font-semibold text-lg py-2 bg-sky-100 border-b border-sky-300">
                    Edited Data
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <NodeForm label="Source ID" value={sourceId} />
                    <NodeForm label="Product Name" value={editedName} />
                    <div className="grid grid-cols-2 gap-4">
                      <NodeForm label="Qty" value={editedQty} />
                      <NodeForm
                        label="Approver"
                        value={item.approver_name ?? item.approver_name}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const Client = () => {
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const { search, searchValue, setSearch } = useSearchQuery();
  const [status, setStatus] = useQueryState("status", { defaultValue: "" });
  const { page, metaPage, setPage, setPagination } = usePagination("p");
  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Scan",
    "Confirm to approve this scan edit",
    "liquid",
  );
  const [RejectDialog, confirmReject] = useConfirm(
    "Reject Scan",
    "Confirm to reject this scan edit",
    "destructive",
  );

  const { data, refetch, isLoading, isRefetching, isError, error, isSuccess } =
    useGetApprovalBast({
      p: page,
      q: searchValue,
      status,
    });
  const { mutate, isPending } = useActionApprovalBast();

  const loading = isLoading || isRefetching;

  const dataList = useMemo(() => {
    return getApprovalList(data);
  }, [data]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const ok =
      action === "approve" ? await confirmApprove() : await confirmReject();

    if (!ok) return;

    mutate(
      { id, action },
      {
        onSuccess: () => {
          setSelectedApproval(null);
        },
      },
    );
  };

  const columns: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {((metaPage.from || 1) + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "source_id",
      header: "Source ID",
      cell: ({ row }) => row.original.source_id ?? row.original.id_asal ?? "-",
    },
    {
      accessorKey: "old_barcode_product",
      header: "Barcode",
      cell: ({ row }) => (
        <div className="break-all max-w-[260px]">
          {row.original.barcode_old_product ??
            row.original.old_barcode_product ??
            "-"}
        </div>
      ),
    },
    {
      accessorKey: "edited_name",
      header: "Edited Name",
      cell: ({ row }) => (
        <div className="break-all max-w-[320px]">
          {row.original.edited_name ?? row.original.edited_name_product ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "edited_qty",
      header: () => <div className="text-center">Edited Qty</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.edited_qty ??
            row.original.edited_quantity_product ??
            "-"}
        </div>
      ),
    },
    {
      accessorKey: "editor_name",
      header: "Editor",
      cell: ({ row }) => row.original.editor_name ?? "-",
    },
    {
      accessorKey: "approver_name",
      header: "Approver",
      cell: ({ row }) => row.original.approver_name ?? "-",
    },
    {
      accessorKey: "approval_status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const currentStatus = getStatus(row.original);

        return (
          <div className="flex justify-center">
            <Badge
              className={cn(
                "rounded px-3 justify-center text-black font-normal capitalize",
                currentStatus === "pending" &&
                  "bg-yellow-300 hover:bg-yellow-300",
                currentStatus === "approved" &&
                  "bg-green-300 hover:bg-green-300",
                currentStatus === "rejected" && "bg-red-300 hover:bg-red-300",
              )}
            >
              {currentStatus}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Approval</div>,
      cell: ({ row }) => {
        const currentStatus = getStatus(row.original);
        const isDone =
          currentStatus === "approved" || currentStatus === "rejected";

        return (
          <div className="flex gap-2 justify-center items-center">
            {isDone ? (
              <Badge className="bg-gray-200 hover:bg-gray-200 text-black font-normal">
                {currentStatus}
              </Badge>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedApproval(row.original);
                }}
                disabled={isPending}
                className="text-black bg-sky-400/80 hover:bg-sky-400 h-7 px-3 [&_svg]:size-3 gap-1"
              >
                <p className="text-xs">Check</p>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowUpRight />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Approval Scan",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data.data.data.resource);
    }
  }, [data, isSuccess]);

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
      <ApproveDialog />
      <RejectDialog />
      <ApprovalDetailDialog
        open={!!selectedApproval}
        item={selectedApproval}
        loading={loading || isPending}
        onClose={() => setSelectedApproval(null)}
        onAction={handleAction}
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
            <BreadcrumbLink href="/inbound/check-product/manifest-inbound">
              Manifest Inbound
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Approval Scan</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Approval Scan</h2>
        </div>
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-wrap gap-3 items-center w-full">
            <Input
              className="w-full sm:w-80 lg:w-[420px] border-sky-400/80 focus-visible:ring-sky-400"
              value={search ?? ""}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search..."
              autoFocus
            />
            <TooltipProviderPage value="Reload Data">
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
                disabled={loading}
              >
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              </Button>
            </TooltipProviderPage>
            <div className="hidden items-center gap-3">
              <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
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
                          status === "approved" &&
                            "bg-green-300 hover:bg-green-300",
                          status === "rejected" &&
                            "bg-red-300 hover:bg-red-300",
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
                        {["pending", "approved", "rejected"].map((item) => (
                          <CommandItem
                            key={item}
                            onSelect={() => {
                              setPage(1);
                              setStatus(item);
                              setIsStatusOpen(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === item}
                              onCheckedChange={() => {
                                setPage(1);
                                setStatus(item);
                                setIsStatusOpen(false);
                              }}
                            />
                            <span className="capitalize">{item}</span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {status && (
                <Button
                  variant="ghost"
                  className="flex px-3"
                  onClick={() => {
                    setPage(1);
                    setStatus("");
                  }}
                >
                  Reset
                  <XCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
          <DataTable columns={columns} data={dataList} isLoading={loading} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
