/* eslint-disable prefer-const */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Eye, ScanBarcode } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

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

    if (key.toLowerCase().includes("price")) {
      return formatRupiah(Number(value));
    }

    return value;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Detail
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Detail</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto pr-2 p-3 border border-sky-500 rounded-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
              <ScanBarcode className="size-4" />
            </div>

            <div className="font-bold text-3xl">{data.barcode_produk}</div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* OLD DATA */}
            <div>
              <div className="bg-sky-100 p-3 text-center font-bold text-xl mb-5">
                Old Data
              </div>

              <div className="space-y-4">
                {allFields.map((field) => {
                  const oldVal = getValue(oldData, field);

                  const newVal = getValue(newData, field);

                  const changed = String(oldVal) !== String(newVal);

                  return (
                    <div key={field}>
                      <label className="font-semibold block mb-1">
                        {field
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </label>

                      <div
                        className={`
                      border rounded-md px-4 py-3
                      ${changed ? "border-red-400 bg-red-50" : "border-sky-300"}
                    `}
                      >
                        {formatValue(field, oldVal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NEW DATA */}
            <div>
              <div className="bg-sky-100 p-3 text-center font-bold text-xl mb-5">
                New Data
              </div>

              <div className="space-y-4">
                {allFields.map((field) => {
                  const oldVal = getValue(oldData, field);

                  const newVal = getValue(newData, field);

                  const changed = String(oldVal) !== String(newVal);

                  return (
                    <div key={field}>
                      <label className="font-semibold block mb-1">
                        {field
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </label>

                      <div
                        className={`
                      border rounded-md px-4 py-3
                      ${
                        changed
                          ? "border-green-500 bg-green-50"
                          : "border-sky-300"
                      }
                    `}
                      >
                        {formatValue(field, newVal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
