"use client";

import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { ColumnDef } from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSearchQuery } from "@/lib/search/use-search-query";
import { usePagination } from "@/lib/pagination/use-pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { useGetApproval } from "../_api/use-get-approval";
import { useActionApproval } from "../_api/use-action-approval";
import { Loader, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const getApprovalList = (data: any): any[] => {
  const resource = data?.data?.data?.resource;

  if (Array.isArray(resource)) return resource;
  if (Array.isArray(resource?.data)) return resource.data;
  return [];
};

const getStatusLabel = (status: any) => {
  const value = String(status ?? "pending").toLowerCase();

  if (value === "approved") return "Approved";
  if (value === "rejected") return "Rejected";
  if (value === "expired") return "Expired";
  if (value === "pending") return "Pending";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const Client = () => {
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, setPage, setMetaPage } = usePagination("p");
  const [isMounted, setIsMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Voucher",
    "Confirm to approve this voucher approval request",
    "liquid",
  );

  const [RejectDialog, confirmReject] = useConfirm(
    "Reject Voucher",
    "Confirm to reject this voucher approval request",
    "destructive",
  );

  const {
    data,
    error,
    isError,
    isLoading,
    isRefetching,
    refetch,
    isPending,
    isSuccess,
  } = useGetApproval({ p: page, q: searchValue, status: statusFilter });

  const { mutate, isPending: isMutating } = useActionApproval();

  const loading = isLoading || isRefetching || isPending;

  const approvalList = useMemo(() => {
    return getApprovalList(data);
  }, [data]);

  useEffect(() => {
    if (data?.data?.data?.resource && !Array.isArray(data.data.data.resource)) {
      setPaginate({
        isSuccess,
        data,
        dataPaginate: data.data.data.resource,
        setPage,
        setMetaPage,
      });
    }
  }, [data, isSuccess, setPage]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Approval",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleApprovalAction = async (
    id: string,
    action: "approve" | "reject",
  ) => {
    const ok =
      action === "approve" ? await confirmApprove() : await confirmReject();
    if (!ok) return;

    mutate({ id, action });
  };

  const columns: ColumnDef<any>[] = [
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
      accessorKey: "date_request",
      header: "Tanggal",
      cell: ({ row }) => {
        const formated = format(
          new Date(row.original.date_request),
          "iiii, dd MMMM yyyy",
        );
        return <div className="tabular-nums">{formated}</div>;
      },
    },
    {
      accessorKey: "requested_by",
      header: "User Kasir",
      cell: ({ row }) => row.original.requested_by ?? "-",
    },
    {
      accessorKey: "buyer_name",
      header: "Buyer",
      cell: ({ row }) => row.original.buyer_name ?? row.original.buyer ?? "-",
    },
    {
      accessorKey: "voucher_name",
      header: "Nama Voucher",
      cell: ({ row }) => row.original.voucher_name ?? "-",
    },
    {
      accessorKey: "usage",
      header: "Pemakaian",
      cell: ({ row }) => row.original.usage ?? "-",
    },
    {
      accessorKey: "nominal",
      header: "Nominal Voucher",
      cell: ({ row }) => formatRupiah(row.original.nominal ?? "0"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded-full text-black shadow-none font-normal",
              row.original.status === "approve" ||
                row.original.approval_status === "approve"
                ? "bg-sky-300 hover:bg-sky-300"
                : row.original.status === "reject" ||
                    row.original.approval_status === "reject"
                  ? "bg-red-300 hover:bg-red-300"
                  : row.original.status === "expired" ||
                      row.original.approval_status === "expired"
                    ? "bg-gray-300 hover:bg-gray-300"
                    : "bg-yellow-300 hover:bg-yellow-300",
            )}
          >
            {getStatusLabel(
              row.original.status ?? row.original.approval_status,
            )}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const status = String(
          row.original.status ?? row.original.approval_status ?? "",
        ).toLowerCase();

        const isDone = ["approved", "rejected", "expired"].includes(status);

        // Hide button jika status approve atau reject
        if (["approve", "reject"].includes(status)) {
          return null;
        }

        return (
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              className="bg-sky-400/80 hover:bg-sky-400 text-black"
              size="sm"
              disabled={loading || isMutating || isDone}
              onClick={() =>
                handleApprovalAction(String(row.original.id), "approve")
              }
            >
              Approve
            </Button>

            <Button
              className="bg-red-400/80 hover:bg-red-400 text-black"
              size="sm"
              disabled={loading || isMutating || isDone}
              onClick={() =>
                handleApprovalAction(String(row.original.id), "reject")
              }
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/sale">Sale</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Approval</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Approval</h2>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-full md:w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={search ?? ""}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cashier..."
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

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 bg-white hidden"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={approvalList}
            isSticky
            maxHeight="max-h-[65vh]"
            isLoading={loading}
          />

          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>

      <ApproveDialog />
      <RejectDialog />
    </div>
  );
};
