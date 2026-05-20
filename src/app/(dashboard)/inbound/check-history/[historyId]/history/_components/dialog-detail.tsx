/* eslint-disable prefer-const */
"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Eye, ScanBarcode, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

const flattenObject = (obj: any) => {
  let result: any[] = [];

  Object.keys(obj || {}).forEach((key) => {
    let value = obj[key];

    // khusus quality
    if (key === "quality" && value && typeof value === "object") {
      value = Object.values(value).find((v) => v !== null) || "-";
    }

    result.push({
      key,
      label: key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      value,
    });
  });

  return result;
};

export default function HistoryComparisonDialog({ data }: any) {
  const oldData = flattenObject(data.old_value);
  const newData = flattenObject(data.new_value);

  const allFields = Array.from(
    new Set([...oldData.map((i) => i.key), ...newData.map((i) => i.key)]),
  );

  const getValue = (arr: any[], key: string) => {
    return arr.find((item) => item.key === key)?.value;
  };

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return "-";

    if (key.toLowerCase().includes("discount")) {
      return `${parseFloat(value).toString()} %`;
    }

    if (key.toLowerCase().includes("price")) {
      return formatRupiah(Number(value));
    }

    return value;
  };

  const isBarcodeField = (field: string) =>
    field.toLowerCase().includes("barcode");

  const isNameField = (field: string) => field.toLowerCase().includes("name");

  const isOldPriceField = (field: string) =>
    field.toLowerCase().includes("old_price");

  const isNewPriceField = (field: string) =>
    field.toLowerCase().includes("new_price");

  const isQtyField = (field: string) => {
    const lowerField = field.toLowerCase();

    return lowerField.includes("qty") || lowerField.includes("quantity");
  };

  const isQualityField = (field: string) =>
    field.toLowerCase().includes("quality");

  const isCategoryField = (field: string) =>
    field.toLowerCase().includes("category");

  const isDiscountField = (field: string) =>
    field.toLowerCase().includes("discount");

  const formatLabel = (field: string) => {
    if (isBarcodeField(field)) return "Barcode";
    if (isNameField(field)) return "Name Product";
    if (isOldPriceField(field)) return "Old Price";
    if (isNewPriceField(field)) return "New Price";
    if (isCategoryField(field)) return "Category";
    if (isQtyField(field)) return "Qty";
    if (isQualityField(field)) return "Quality";
    if (isDiscountField(field)) return "Discount";

    return field
      .replace(/^(old|new)_/, "")
      .replace(/_product$/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
  };

  const barcodeNameFields = [
    ...allFields.filter(isBarcodeField),
    ...allFields.filter(isNameField),
  ];
  const priceFields = [
    ...allFields.filter(isOldPriceField),
    ...allFields.filter(isNewPriceField),
  ];
  const categoryFields = [
    ...allFields.filter(isCategoryField),
  ];
  const qtyQualityFields = [
    ...allFields.filter(isQtyField),
    ...allFields.filter(isQualityField),
  ];
  const otherFields = allFields.filter(
    (field) =>
      !isBarcodeField(field) &&
      !isNameField(field) &&
      !isOldPriceField(field) &&
      !isNewPriceField(field) &&
      !isCategoryField(field) &&
      !isQtyField(field) &&
      !isQualityField(field),
  );

  const renderField = (field: string, type: "old" | "new") => {
    const oldVal = getValue(oldData, field);
    const newVal = getValue(newData, field);
    const changed = String(oldVal) !== String(newVal);
    const value = type === "old" ? oldVal : newVal;
    const changedClass =
      type === "old"
        ? "border-red-400 bg-red-50"
        : "border-green-500 bg-green-50";

    return (
      <div key={`${type}-${field}`} className="min-w-0">
        <label className="font-semibold block mb-1">{formatLabel(field)}</label>

        <div
          className={`
            border rounded-md px-4 py-3 break-words
            ${changed ? changedClass : "border-sky-300"}
          `}
        >
          {formatValue(field, value)}
        </div>
      </div>
    );
  };

  const renderFieldGroup = (type: "old" | "new") => (
    <div className="space-y-4">
      {barcodeNameFields.map((field) => renderField(field, type))}

      {priceFields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 min-w-0">
          {priceFields.map((field) => renderField(field, type))}
        </div>
      )}

      {categoryFields.map((field) => renderField(field, type))}

      {qtyQualityFields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 min-w-0">
          {qtyQualityFields.map((field) => renderField(field, type))}
        </div>
      )}

      {otherFields.map((field) => renderField(field, type))}
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Detail
        </Button>
      </DialogTrigger>

      <DialogContent
        onClose={false}
        className="w-[75vw] max-w-[75vw] h-[78vh] flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail
            <TooltipProviderPage value="close" side="left">
              <DialogClose asChild>
                <button className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </DialogClose>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>
        <div className="w-full flex-1 min-h-0 overflow-y-auto rounded-md border border-sky-400/80 p-3">
          <div className="flex items-center gap-3 pb-2">
            <div className="size-10 flex items-center justify-center rounded-full bg-sky-200">
              <ScanBarcode className="size-4" />
            </div>

            <div className="min-w-0 break-all font-bold text-xl">
              {data.barcode_produk}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-0">
            {/* OLD DATA */}
            <div className="min-w-0 flex flex-col gap-4">
              <div className="w-full text-center font-semibold text-lg py-2 bg-sky-100">
                Old Data
              </div>

              {renderFieldGroup("old")}
            </div>

            {/* NEW DATA */}
            <div className="min-w-0 flex flex-col gap-4">
              <div className="w-full text-center font-semibold text-lg py-2 bg-sky-100">
                New Data
              </div>

              {renderFieldGroup("new")}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
