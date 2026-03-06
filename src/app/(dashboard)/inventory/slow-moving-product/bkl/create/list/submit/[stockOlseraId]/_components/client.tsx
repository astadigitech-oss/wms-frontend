"use client";

import { ArrowLeft, RefreshCcw } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { useGetListTagColorWMS } from "../_api/use-get-list-tag-color-wms";
import { useQueryState } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBKL } from "../_api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetDetailStockReturOlsera } from "../_api/use-get-detail-stock-olsera";

export const Client = () => {
  const router = useRouter();
  const { stockOlseraId } = useParams();
  const searchParams = useSearchParams();
  const destinationId = searchParams.get("destinationId");
  const [isMounted, setIsMounted] = useState(false);
  const [dataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateBKL();

  const { data } = useGetListTagColorWMS({ q: searchValue });
  const {
    data: detailBKL,
    refetch: refetchBKL,
    isFetching,
  } = useGetDetailStockReturOlsera({
    id: stockOlseraId,
    destinationId: destinationId,
  });
  const dataListColor: any[] = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const detailData: any = useMemo(() => {
    return detailBKL?.data.data.resource.data;
  }, [detailBKL]);

  type ColorItem = { color: string; qty: string };
  const [formState, setFormState] = useState<{
    name: string;
    damaged: string;
    quantity: string;
    colors: ColorItem[];
  }>({
    name: "",
    damaged: "",
    quantity: "0",
    colors: [{ color: "", qty: "0" }],
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();

    if (!dataListColor || !detailData) return;

    const mappedColors = formState.colors
      .filter((c) => c.color && c.qty)
      .map((c) => {
        const found = dataListColor.find(
          (item: any) => item.name_color === c.color,
        );

        return {
          color_tag_id: found?.id,
          qty: Number(c.qty),
        };
      })
      .filter((c) => c.color_tag_id);

    const body = {
      destination_id: detailData.destination_id,
      olsera_document_id: detailData.id,
      olsera_document_code: detailData.trans_no,
      damage_qty: Number(formState.quantity),
      colors: mappedColors,
    };

    mutateCreate(
      { body },
      {
        onSuccess: () => {
          router.push("/inventory/slow-moving-product/bkl");
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
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
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {detailData && (
        <div className="bg-white rounded shadow p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-semibold">Detail Retur Olsera</h2>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => refetchBKL()}
              className="flex items-center gap-2"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Trans No</p>
              <p className="font-medium">{detailData.trans_no}</p>
            </div>

            <div>
              <p className="text-gray-500">Tanggal</p>
              <p className="font-medium">{detailData.fdate}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                {detailData.status_desc}
              </span>
            </div>

            <div>
              <p className="text-gray-500">Total Qty</p>
              <p className="font-medium">{detailData.ftotal_qty}</p>
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-gray-500 text-sm">Note</p>
            <p className="text-sm">{detailData.note}</p>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Items</h3>

            <div className="border rounded">
              {detailData.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border-b last:border-b-0"
                >
                  <div className="flex flex-col flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-gray-500">
                      SKU: {item.product_sku || "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Qty</p>
                    <p className="font-semibold">{item.fqty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Expected */}
          <div className="grid grid-cols-3 gap-4 text-sm border-t pt-3">
            <div>
              <p className="text-gray-500">Expected 12K</p>
              <p className="font-medium">
                {detailData.summary_expected_qty?.total_qty_12K}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Expected 24K</p>
              <p className="font-medium">
                {detailData.summary_expected_qty?.total_qty_24K}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Total Expected</p>
              <p className="font-medium">
                {detailData.summary_expected_qty?.total_qty}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/inventory/slow-moving-product/bkl">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Create BKL</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-full flex items-start justify-between">
              <h2 className="text-lg font-semibold">Create BKL</h2>
              <Button
                onClick={handleCreate}
                disabled={isPendingCreate}
                className="bg-sky-500 text-white"
              >
                Submit
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Damaged"
                  value={formState.damaged}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, damaged: e.target.value }))
                  }
                  className="px-3 py-2 border rounded w-1/2 border-sky-400/80 focus-visible:ring-sky-400"
                  disabled
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={formState.quantity}
                  onChange={(e) =>
                    setFormState((s) => {
                      let val = e.target.value;

                      // Hilangkan leading zero (contoh: 001 → 1)
                      if (val.startsWith("0")) val = val.replace(/^0+/, "");

                      // Jika kosong, jadikan "0"
                      if (val === "") val = "0";

                      return {
                        ...s,
                        quantity: val,
                      };
                    })
                  }
                  className="px-3 py-2 border rounded w-1/2 border-sky-400/80 focus-visible:ring-sky-400"
                />
              </div>

              <hr className="border-t my-2" />

              <div className="flex flex-col gap-3">
                {formState.colors.map((c, idx) => (
                  <div key={idx} className="flex gap-3 items-center ">
                    <Select
                      value={c.color}
                      onValueChange={(val) =>
                        setFormState((s) => {
                          const next = { ...s };
                          next.colors[idx].color = val;
                          return next;
                        })
                      }
                    >
                      <SelectTrigger className="px-3 py-2 border rounded w-1/2 border-sky-400/80 focus-visible:ring-sky-400">
                        <SelectValue placeholder="Pilih Warna" />
                      </SelectTrigger>

                      <SelectContent>
                        {dataListColor?.map((item, i) => (
                          <SelectItem key={i} value={item.name_color}>
                            {item.name_color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={c.qty}
                      onChange={(e) =>
                        setFormState((s) => {
                          const next = { ...s };
                          let val = e.target.value;

                          // sama seperti manual inbound
                          if (val.startsWith("0")) val = val.replace(/^0+/, "");
                          if (val === "") val = "0";

                          next.colors[idx].qty = val;
                          return next;
                        })
                      }
                      className="px-3 py-2 border rounded w-1/3 border-sky-400/80 focus-visible:ring-sky-400"
                    />

                    <Button
                      type="button"
                      variant={"outline"}
                      className=" border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                      onClick={() =>
                        setFormState((s) => ({
                          ...s,
                          colors: s.colors.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  className="bg-sky-400 border-sky-400 text-white hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  onClick={() =>
                    setFormState((s) => ({
                      ...s,
                      colors: [...s.colors, { color: "", qty: "0" }],
                    }))
                  }
                >
                  Tambah +
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
