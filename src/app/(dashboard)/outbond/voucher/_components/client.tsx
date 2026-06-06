"use client";

import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2, PlusCircle, ReceiptText, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useGetListVoucher } from "../_api/use-get-list-voucher";
import { useCreateVoucher } from "../_api/use-create-voucher";

const DialogCreateVoucher = dynamic(() => import("./dialog-create-voucher"), {
  ssr: false,
});

const emptyInput = {
  name: "",
  amount: "",
  max_value: "",
  max_weeks: "",
};

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [input, setInput] = useState(emptyInput);

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1,
    from: 1,
    total: 1,
    perPage: 1,
  });

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListVoucher({ p: page, q: searchValue });

  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateVoucher();

  const voucherResource = useMemo(() => {
    return data?.data?.data?.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    if (Array.isArray(voucherResource)) return voucherResource;
    if (Array.isArray(voucherResource?.data)) return voucherResource.data;
    return [];
  }, [voucherResource]);

  const loading = isLoading || isRefetching || isPending;

  useEffect(() => {
    if (!voucherResource || Array.isArray(voucherResource)) return;

    setPaginate({
      isSuccess,
      data,
      dataPaginate: voucherResource,
      setPage,
      setMetaPage,
    });
  }, [data, isSuccess, setPage, voucherResource]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Voucher",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setInput(emptyInput);
  };

  const handleCreate = () => {
    const body = {
      name: input.name,
      amount: Number(input.amount || 0),
      max_value: Number(input.max_value || 0),
      max_weeks: Number(input.max_weeks || 0),
    };

    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleCloseCreate();
        },
      }
    );
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
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => row.original.code ?? row.original.code_voucher ?? "-",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name ?? row.original.name_voucher ?? "-",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        formatRupiah(row.original.amount ?? row.original.amount_voucher ?? 0),
    },
    {
      accessorKey: "usage",
      header: () => <div className="text-center">Usage</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(
            row.original.usage ??
            row.original.usage_voucher ??
            row.original.used_count ??
            0
          ).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "max_value",
      header: "Max Value",
      cell: ({ row }) =>
        formatRupiah(
          row.original.max_value ?? row.original.max_value_voucher ?? 0
        ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const isActive =
          row.original.is_active ?? row.original.status === "active";

        return (
          <div className="flex justify-center">
            <Badge
              className={cn(
                "rounded-full text-black shadow-none font-normal",
                isActive
                  ? "bg-sky-300 hover:bg-sky-300"
                  : "bg-gray-200 hover:bg-gray-200"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "max_weeks",
      header: () => <div className="text-center">Max Weeks</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.max_weeks ?? row.original.max_week ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant={"outline"}
              asChild
            >
              <Link href={`/outbond/voucher/detail/${row.original.id}`}>
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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
      <DialogCreateVoucher
        open={openCreate}
        onCloseModal={handleCloseCreate}
        input={input}
        setInput={setInput}
        handleSubmit={handleCreate}
        isPending={isPendingCreate}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Voucher</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-sky-700" />
          <h2 className="text-xl font-bold">List Voucher</h2>
        </div>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
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
              <div className="flex gap-4 items-center ml-auto">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenCreate(true);
                  }}
                  disabled={isPendingCreate}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black"
                  variant={"outline"}
                >
                  {isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Create Voucher
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
