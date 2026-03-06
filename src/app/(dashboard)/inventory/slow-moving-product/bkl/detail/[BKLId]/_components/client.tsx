"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Loading from "@/app/(dashboard)/loading";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetDetailBKL } from "../_api/use-get-detail-bkl";

export const Client = () => {
  const { BKLId } = useParams();
  const [isMounted, setIsMounted] = useState(false);

  const { data: detailBKL, refetch: refetchBKL } = useGetDetailBKL({
    id: BKLId,
  });

  const dataDetailBKL: any = useMemo(() => {
    return detailBKL?.data.data.resource;
  }, [detailBKL]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col bg-gray-100 w-full px-6 py-6 gap-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Slow Moving Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/slow-moving-product/bkl">
              BKL
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4">
          <Link href="/inventory/slow-moving-product/bkl">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Detail BKL</h1>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchBKL()}
              className="hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Nama Dokumen</p>
            <p className="font-medium text-gray-800">
              {dataDetailBKL?.code_document_bkl || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                dataDetailBKL?.status === "done"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {dataDetailBKL?.status?.toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Qty Damaged</p>
            <p className="font-medium text-gray-800">
              {dataDetailBKL?.items?.find((it: any) => it.is_damaged === 1)
                ?.qty || 0}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t pt-6">
          <h2 className="font-semibold text-lg mb-4">Detail Warna</h2>

          <div className="flex flex-col gap-3">
            {dataDetailBKL?.items
              ?.filter((it: any) => it.is_damaged !== 1)
              ?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-gray-500">Warna</p>
                    <p className="font-medium">
                      {item.color_tag?.name_color || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{item.qty}</p>
                  </div>
                </div>
              ))}

            {dataDetailBKL?.items?.filter((it: any) => it.is_damaged !== 1)
              ?.length === 0 && (
              <p className="text-sm text-gray-400">Tidak ada detail warna</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
