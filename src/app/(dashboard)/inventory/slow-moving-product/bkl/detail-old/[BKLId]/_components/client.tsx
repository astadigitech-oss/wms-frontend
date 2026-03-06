"use client";

import { ArrowLeft } from "lucide-react";
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
import { useParams, useRouter } from "next/navigation";
import { useGetDetailBKL } from "../_api/use-get-detail-bkl";
import { useUpdateBKL } from "../_api";
import { useToEditBKL } from "../_api/use-to-edit-b2b";

export const Client = () => {
  const router = useRouter();
  const { BKLId } = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [dataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateBKL({
    id: BKLId,
  });
  const { mutate: mutateToEdit, isPending: isPendingToEdit } = useToEditBKL({
    id: BKLId,
  });

  const { data } = useGetListTagColorWMS({ q: searchValue });

  const { data: detailBKL, refetch: refetchBKL } = useGetDetailBKL({
    id: BKLId,
  });

  const dataListColor: any[] = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataDetailBKL: any = useMemo(() => {
    return detailBKL?.data.data.resource;
  }, [detailBKL]);

  // ⬇⬇ DISABLE SEMUA INPUT JIKA STATUS DONE
  const isDisabled = dataDetailBKL?.status === "done";

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

  // ⬇ AUTO FILL
  useEffect(() => {
    if (!dataDetailBKL) return;

    const damagedItem = dataDetailBKL.items?.find(
      (it: any) => it.is_damaged === 1
    );

    const colorItems =
      dataDetailBKL.items
        ?.filter((it: any) => it.is_damaged !== 1)
        .map((it: any) => ({
          color: it.color_tag?.name_color ?? "",
          qty: String(it.qty),
        })) ?? [];

    setFormState({
      name: dataDetailBKL.code_document_bkl ?? "",
      damaged: "damaged",
      quantity: damagedItem?.qty || 0,
      colors: colorItems.length > 0 ? colorItems : [{ color: "", qty: "" }],
    });
  }, [dataDetailBKL]);

  const handleToEdit = () => {
    mutateToEdit(
      {},
      {
        onSuccess: async () => {
          await refetchBKL(); // ambil ulang detail dengan status terbaru

          // setelah API "to edit", biasanya status berubah → editable
          // maka aktifkan kembali form
        },
      }
    );
  };

  // CREATE
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (isDisabled) return; // jika done → tidak ada create
    if (!dataListColor) return;

    const mappedColors = formState.colors
      .filter((c) => c.color && c.qty)
      .map((c) => {
        const found = dataListColor.find(
          (item: any) => item.name_color === c.color
        );
        return {
          color_tag_id: found?.id,
          qty: Number(c.qty),
        };
      })
      .filter((c) => c.color_tag_id);

    const body: Record<string, any> = {
      name_document: formState.name,
      type: "in",
      colors: mappedColors,
    };
    const qty = Number(formState.quantity);
    if (qty > 0) {
      body.damage_qty = qty;
    }

    mutateUpdate(
      { body },
      {
        onSuccess: () => {
          router.push("/inventory/slow-moving-product/bkl");
          refetchBKL();
        },
      }
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
          <BreadcrumbItem>Update</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/inventory/slow-moving-product/bkl">
              <Button
                disabled={isDisabled}
                className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none"
              >
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">
              Update BKL {isDisabled && "(Completed)"}
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-full flex items-start justify-between">
              <h2 className="text-lg font-semibold">Update BKL</h2>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  onClick={handleToEdit}
                  disabled={isPendingToEdit}
                  className="bg-sky-500 text-white disabled:bg-gray-400"
                >
                  To Edit
                </Button>
              </div>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-4 items-center">
                <Input
                  disabled
                  placeholder="Nama"
                  value={formState.name}
                  className="px-3 py-2 border rounded w-1/3"
                />
              </div>

              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Damaged"
                  value={formState.damaged}
                  disabled
                  className="px-3 py-2 border rounded w-1/2"
                />

                <Input
                  type="number"
                  placeholder="Quantity"
                  value={formState?.quantity || "0"}
                  onChange={(e) =>
                    setFormState((s) => {
                      let val = e.target.value;
                      if (val.startsWith("0")) val = val.replace(/^0+/, "");
                      if (val === "") val = "0";
                      return {
                        ...s,
                        quantity: val,
                      };
                    })
                  }
                  disabled={isDisabled}
                  className="px-3 py-2 border rounded w-1/2"
                />
              </div>

              <hr className="border-t my-2" />

              <div className="flex flex-col gap-3">
                {formState.colors.map((c, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    {/* <Select
                      value={c.color}
                      disabled={isDisabled}
                      onValueChange={(val) =>
                        setFormState((s) => {
                          const next = { ...s };
                          next.colors[idx].color = val;
                          return next;
                        })
                      }
                    >
                      <SelectTrigger className="px-3 py-2 border rounded w-1/2">
                        <SelectValue placeholder="Pilih Warna" />
                      </SelectTrigger>

                      <SelectContent>
                        {dataListColor?.map((item, i) => (
                          <SelectItem key={i} value={item.name_color}>
                            {item.name_color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
                    <Select
                      value={c.color}
                      disabled={isDisabled}
                      onValueChange={(val) =>
                        setFormState((s) => {
                          const next = { ...s };
                          next.colors[idx].color = val;
                          return next;
                        })
                      }
                    >
                      <SelectTrigger className="px-3 py-2 border rounded w-1/2">
                        <SelectValue placeholder="Pilih Warna" />
                      </SelectTrigger>

                      <SelectContent>
                        {dataListColor
                          ?.filter((item: any) => {
                            const selectedColors = formState.colors.map(
                              (c) => c.color
                            );

                            const isSelectedByOther =
                              selectedColors.includes(item.name_color) &&
                              item.name_color !== c.color;

                            return !isSelectedByOther;
                          })
                          .map((item: any, i: number) => (
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
                      disabled={isDisabled}
                      onChange={(e) =>
                        setFormState((s) => {
                          const next = { ...s };
                          let val = e.target.value;
                          if (val.startsWith("0")) val = val.replace(/^0+/, "");
                          if (val === "") val = "0";

                          next.colors[idx].qty = val;
                          return next;
                        })
                      }
                      className="px-3 py-2 border rounded w-1/3"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDisabled}
                      className="border-red-400 text-red-700 disabled:text-gray-400"
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

              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  disabled={isDisabled}
                  className="bg-sky-400 text-white disabled:bg-gray-400"
                  onClick={() =>
                    setFormState((s) => ({
                      ...s,
                      colors: [...s.colors, { color: "", qty: "0" }],
                    }))
                  }
                >
                  Tambah +
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isDisabled || isPendingUpdate}
                  className=" bg-yellow-400 text-white disabled:bg-gray-400"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
