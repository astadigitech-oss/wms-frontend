"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileDown,
  FileSpreadsheet,
  Loader2,
  RefreshCcw,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn, promiseToast } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs";
import { useUploadBulking } from "../_api/use-upload-bulking";
import Loading from "@/app/(dashboard)/loading";
import { useExportTemplate } from "../_api/use-export-template";

interface UploadedFileProps {
  file: File;
  name: string;
  size: number;
}

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [typeBulk, setTypeBulk] = useQueryState(
    "type",
    parseAsStringLiteral(["category", "color", ""] as const).withDefault("")
  );
  const [isDialogOpen, setIsDialogOpen] = useQueryState(
    "typeOpen",
    parseAsBoolean.withDefault(false)
  );
  const [errorMsg, setErrorMsg] = useState([]);
  const [isErrorOpen, setIsErrorOpen] = useQueryState(
    "isError",
    parseAsBoolean.withDefault(false)
  );
  const { mutate } = useUploadBulking();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportTemplate();

  // state data
  const [selectedFile, setSelectedFile] = useState<UploadedFileProps | null>(
    null
  );
  const [isExtra, setIsExtra] = useState(false);

  const handleComplete = async () => {
    const body = new FormData();
    if (selectedFile?.file) {
      body.append("file", selectedFile.file);
    }
    body.append("is_extra", String(isExtra));

    const promise = new Promise((resolve, reject) => {
      mutate(
        { value: body, type: typeBulk },
        {
          onSuccess: (data) => {
            resolve(data);
            setSelectedFile(null);
            setIsExtra(false);
            setTypeBulk("");
          },
          onError: (error) => {
            reject(error);
            setErrorMsg((error?.response?.data as any)?.data?.resource);
            setIsErrorOpen(true);
            setTypeBulk("");
          },
        }
      );
    });

    promiseToast({
      promise,
      loading: "Uploading...",
      success: "File Successfully uploaded",
      error: (err) =>
        (err?.response?.data as any)?.data?.message || "File failed to upload",
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setIsExtra(false);
      return setSelectedFile({
        file,
        name: file.name,
        size: file.size,
      });
    }
  };

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

  // handle export
  const handleExport = async () => {
    mutateExport(undefined, {
      onSuccess: (res: any) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Dialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resource Error:</DialogTitle>
            <DialogDescription>Check please some error</DialogDescription>
          </DialogHeader>
          <ul className="w-full max-h-[50vh] overflow-y-auto">
            {errorMsg?.map((item, i) => (
              <li
                key={item + i}
                className="py-2 px-4 border-b last:border-0 border-gray-400"
              >
                {item}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Bulking</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="capitalize">{typeBulk}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative">
        <div className="p-4 bg-white rounded shadow">
          {!selectedFile ? (
            <>
              <div className="w-full flex items-center justify-between mb-4">
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="flex gap-3 items-center">
                    <h2 className="text-xl font-bold">Bulking Product</h2>
                  </div>

                  <Button
                    type="button"
                    variant={"liquid"}
                    className="font-semibold flex items-center gap-2"
                    onClick={handleExport}
                    disabled={isPendingExport}
                  >
                    {isPendingExport ? (
                      <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    Export Template
                  </Button>
                </div>
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded h-52 flex items-center justify-center text-center cursor-default ${
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
            </>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Bulking Product</h2>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant={"ghost"}
                        className={cn(
                          "text-xl px-0 hover:bg-transparent font-bold underline-offset-2 hover:underline capitalize",
                          !typeBulk && "underline"
                        )}
                      >
                        <p>{typeBulk || "Select Type"}</p>
                        <ChevronDown className="h-4 w-4 stroke-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs">
                      <DialogHeader>
                        <DialogTitle>Select a type:</DialogTitle>
                        <DialogDescription>
                          Select a bulking type
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setTypeBulk("category");
                            setErrorMsg([]);
                          }}
                          className="justify-start"
                        >
                          <CheckCircle2
                            className={cn(
                              "w-4 h-4 mr-2",
                              typeBulk === "category"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Category
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setTypeBulk("color");
                            setErrorMsg([]);
                          }}
                          className="justify-start"
                        >
                          <CheckCircle2
                            className={cn(
                              "w-4 h-4 mr-2",
                              typeBulk === "color" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Color
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {errorMsg?.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => setIsErrorOpen(true)}
                      className="size-6 p-0 rounded-full bg-red-200 hover:bg-red-300 hover:text-black text-black"
                    >
                      <AlertCircle className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="flex text-sm items-center text-gray-500 hover:underline"
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setIsExtra(false);
                      setErrorMsg([]);
                    }}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Change File
                  </button>
                  {errorMsg?.length === 0 && (
                    <Button
                      onClick={handleComplete}
                      className="bg-sky-300/80 hover:bg-sky-300 text-black"
                      disabled={!typeBulk}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                <li className="text-sm flex gap-4 px-5 py-3 rounded-md bg-gray-100">
                  <div className="w-10 h-10 rounded-full shadow justify-center flex items-center bg-gradient-to-br from-green-400 to-green-600 text-white">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold">{selectedFile.name}</p>
                    <p className="font-light text-gray-500 text-xs">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </li>
              </ul>
              <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                <Checkbox
                  checked={isExtra}
                  onCheckedChange={(checked) => setIsExtra(checked === true)}
                />
                is_extra
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
