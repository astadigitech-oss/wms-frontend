import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  RefreshCcw,
  FileSpreadsheet,
  X,
  UploadCloud,
  Check,
  AlertTriangle,
} from "lucide-react";

import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { UseMutationResult } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

interface UploadedFileProps {
  file: File;
  name: string;
  size: number;
}

export const DialogUpload = ({
  open,
  onOpenChange,
  handleAddProduct,
  addProductMutate,
}: {
  open: boolean;
  onOpenChange: () => void;
  addProductMutate: UseMutationResult<
    AxiosResponse<any, any>,
    Error,
    any,
    unknown
  >;
  handleAddProduct: ({
    type,
    barcode,
    file,
  }: {
    type: "product" | "file";
    barcode?: string;
    file?: File;
  }) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFileProps | null>(
    null
  );
  const [isNotif, setIsNotif] = useState("");
  const [count, setCount] = useState(0);

  const { data, isSuccess, reset } = addProductMutate;
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      return setSelectedFile({
        file,
        name: file.name,
        size: file.size,
      });
    }
  };

  const dataResponse = data?.data.data.resource ?? null;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1, // Limit file upload to only one
  });

  useEffect(() => {
    if (count === 0) {
      setIsNotif("");
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if ((open && isSuccess) || !open) {
      setSelectedFile(null);
    }
    if (open && isSuccess && dataResponse?.import) {
      if (
        dataResponse?.data_barcode_not_found.length > 0 ||
        dataResponse?.data_barcode_duplicate.length > 0
      ) {
        setIsNotif("warning");
      } else {
        setIsNotif("success");
        setCount(5);
        reset();
      }
    }
    if (!open) {
      setIsNotif("");
      reset();
    }
  }, [open, isSuccess, count]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Upload File
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {isNotif === "" && (
          <div className="w-full">
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded h-80 flex items-center justify-center text-center cursor-default ${
                  isDragActive ? "border-blue-500" : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-blue-500">Drop the files here ...</p>
                ) : (
                  <div className="flex justify-center flex-col items-center gap-2">
                    <p>Drag & drop some files here, or click to select files</p>
                    <p className="text-sky-500 text-sm font-semibold">
                      (.xlsx, .xls)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm flex gap-4 h-80 rounded-md bg-gradient-to-tl from-gray-200 to-gray-100 flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full shadow justify-center flex items-center bg-gradient-to-br from-green-400 to-green-600 text-white">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-semibold">{selectedFile.name}</p>
                  <p className="font-light text-gray-500 text-xs">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant={"outline"}
                    className="bg-transparent border-gray-500"
                    size={"sm"}
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                  >
                    <RefreshCcw className="size-2" />
                    Change File
                  </Button>
                  <Button
                    variant={"liquid"}
                    size={"sm"}
                    onClick={() => {
                      handleAddProduct({
                        type: "file",
                        file: selectedFile.file,
                      });
                    }}
                  >
                    <UploadCloud className="size-2" />
                    Upload
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        {isNotif === "success" && (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3">
            <div className="size-14 flex justify-center items-center bg-green-500 text-white rounded-full shadow">
              <Check className="size-10" />
            </div>
            <h5 className="text-xl font-bold">File Successfuly Uploaded</h5>
            <p>
              Data Found: {dataResponse?.total_barcode_found.toLocaleString()}
            </p>
            <p>Notif will be close in {count} second</p>
          </div>
        )}
        {isNotif === "warning" && (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3">
            <div className="w-full flex items-center justify-between gap-4 pb-2 border-b border-gray-500">
              <div className="flex items-center gap-4 justify-start w-full ">
                <div className="size-10 flex justify-center items-center bg-yellow-500 text-white rounded-full shadow flex-none">
                  <AlertTriangle className="size-7" />
                </div>
                <div className="flex flex-col items-start">
                  <h5 className="text-lg font-bold">
                    File Successfuly Uploaded
                  </h5>
                  <p className="text-sm">
                    Data Found:{" "}
                    {dataResponse?.total_barcode_found.toLocaleString()} and
                    Data Not Found:{" "}
                    {dataResponse?.total_barcode_not_found.toLocaleString()},
                    with note:
                  </p>
                </div>
              </div>
              <Button
                variant={"outline"}
                onClick={() => {
                  setIsNotif("");
                  reset();
                }}
              >
                Upload More
              </Button>
            </div>
            <div className="w-full h-full flex gap-3">
              {dataResponse?.data_barcode_not_found.length > 0 && (
                <div className="w-1/2">
                  <p className="font-semibold pb-2">Data tidak ditemukan:</p>
                  <div className="w-full h-52 overflow-y-auto">
                    <ul className="list-disc pl-6">
                      {dataResponse?.data_barcode_not_found.map(
                        (item: any, idx: number) => (
                          <li key={`${item}-${idx}`}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
              {dataResponse?.data_barcode_duplicate.length > 0 && (
                <div className="w-full">
                  <p className="font-semibold pb-2">Data duplikat:</p>
                  <div className="w-full h-52 overflow-y-auto">
                    <ul className="list-disc pl-6">
                      {dataResponse?.data_barcode_duplicate.map(
                        (item: any, idx: number) => (
                          <li key={`${item}-${idx}`}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
