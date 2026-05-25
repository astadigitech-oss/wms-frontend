"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Barcode,
  Check,
  Disc,
  FileSpreadsheet,
  FileText,
  FolderEdit,
  Gem,
  Loader,
  MoreHorizontal,
  RefreshCcw,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn, promiseToast } from "@/lib/utils";
import { useUploadInbound } from "../_api/use-upload-inbound";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDropzone } from "react-dropzone";
import { useMergeHeader } from "../_api/use-merge-header";
import Loading from "@/app/(dashboard)/loading";
import { AxiosError } from "axios";
import { useGetCogs } from "../_api/use-get-cogs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadedFileProps {
  file: File;
  name: string;
  size: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);

  const {
    data: dataCogs,
    // refetch: refetchCogs,
    // isLoading: isLoadingCogs,
    // isRefetching: isRefetchingCogs,
    // isPending: isPendingCogs,
    // isSuccess: isSuccessCogs,
    // error: errorCogs,
    // isError: isErrorCogs,
  } = useGetCogs();

  // data RES memo Cogs
  const Cogs: any = useMemo(() => {
    return dataCogs?.data.data.resource;
  }, [dataCogs]);

  const {
    mutate: mutateUpload,
    isPending: isPendingUpload,
    isSuccess: isSuccessUpload,
    isError: isErrorUpload,
    error: errorUpload,
  } = useUploadInbound();
  const {
    mutate: mutateMerge,
    isPending: isPendingMerge,
    isSuccess: isSuccessMerge,
    isError: isErrorMerge,
    error: errorMerge,
  } = useMergeHeader();

  // slide core
  const [direction, setDirection] = useState(0);

  // state data
  const [selectedFile, setSelectedFile] = useState<UploadedFileProps | null>(
    null,
  );
  const [results, setResults] = useState<any>();
  const [headers, setHeaders] = useState<string[]>([]);
  const [selected, setSelected] = useState({
    barcode: "",
    name: "",
    qty: "",
    price: "",
  });
  const [selectedCogs, setSelectedCogs] = useState("");

  // handle slide
  const handleNext = () => {
    if (direction === 0) {
      setDirection(1);
      handleUpload();
    } else {
      handleComplete();
    }
  };

  const handleUpload = async () => {
    const body = new FormData();
    if (selectedFile?.file) {
      body.append("file", selectedFile.file);
    }

    const promise = new Promise((resolve, reject) => {
      mutateUpload(body, {
        onSuccess: (data) => {
          resolve(data);
          setResults(data.data.data.resource);
          setHeaders(data.data.data.resource.headers);
        },
        onError: (error) => reject(error),
      });
    });

    promiseToast({
      promise,
      loading: "Uploading...",
      success: "File Successfully uploaded",
      error: "File failed to upload",
    });
  };

  const handleComplete = async () => {
    const promise = new Promise((resolve, reject) => {
      mutateMerge(
        {
          code_document: results?.code_document?.code_document,
          channel_id: selectedCogs,
          headerMappings: {
            old_barcode_product: [selected.barcode],
            old_name_product: [selected.name],
            old_quantity_product: [selected.qty],
            old_price_product: [selected.price],
          },
        },
        {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        },
      );
    });

    promiseToast({
      promise,
      loading: "Submiting...",
      success: "File Successfully merged",
      error: "File failed to merge",
    });
  };

  // handle upload file
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile({
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <div className="grid grid-cols-4 w-full bg-white rounded-md overflow-hidden shadow">
        <div className="flex border-r px-4 items-center gap-4 w-full h-20">
          {selectedFile ? (
            <div
              className={cn(
                "w-10 h-10 rounded-full shadow justify-center flex items-center",
                isSuccessUpload
                  ? "bg-green-100 text-green-500"
                  : "bg-gray-100 text-gray-500",
              )}
            >
              {isSuccessUpload ? (
                <Check className="w-5 h-5" />
              ) : isErrorUpload ? (
                <AlertCircle className="w-5 h-5" />
              ) : isPendingUpload ? (
                <Loader className="size-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full shadow justify-center flex items-center bg-gray-100">
              <MoreHorizontal className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <h5 className="font-medium capitalize">upload file</h5>
            <p
              className={cn(
                "text-xs",
                selectedFile && isSuccessUpload
                  ? "text-green-500"
                  : isErrorUpload
                    ? "text-red-400"
                    : "text-gray-400",
              )}
            >
              {selectedFile
                ? isSuccessUpload
                  ? "completed"
                  : isErrorUpload
                    ? "failed"
                    : isPendingUpload
                      ? "pending"
                      : "click next for upload"
                : "current"}
            </p>
          </div>
        </div>
        <div className="flex border-r px-4 items-center gap-4 w-full h-20">
          <div className="w-10 h-10 rounded-full shadow justify-center flex items-center bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h5 className="font-medium capitalize">pick header</h5>
            <p
              className={cn(
                "text-xs",
                isErrorMerge ? "text-red-400" : "text-gray-400",
              )}
            >
              {direction === 1
                ? "current"
                : isErrorMerge
                  ? "failed"
                  : "not complete"}
            </p>
          </div>
        </div>
        <button
          onClick={handleNext}
          className={cn(
            "border-r px-4 items-center w-full h-20 hover:gap-4 gap-2 group transition-all flex disabled:cursor-not-allowed col-span-2",
          )}
          disabled={
            (!selectedFile && direction === 0) ||
            (direction === 1 &&
              (!selected.barcode ||
                !selected.name ||
                !selected.price ||
                !selected.qty))
          }
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full group-hover:shadow justify-center flex items-center  transition-all",
              (!selectedFile && direction === 0) ||
                (direction === 1 &&
                  (!selected.barcode ||
                    !selected.name ||
                    !selected.price ||
                    !selected.qty))
                ? "group-hover:bg-gray-100"
                : "group-hover:bg-green-300",
            )}
          >
            {direction === 1 ? (
              <>
                {selected.barcode &&
                selected.name &&
                selected.price &&
                selected.qty ? (
                  <Save className="w-5 h-5" />
                ) : (
                  <Ban className="w-5 h-5" />
                )}
              </>
            ) : (
              <>
                {selectedFile ? (
                  <ArrowRight className="w-5 h-5" />
                ) : (
                  <Ban className="w-5 h-5" />
                )}
              </>
            )}
          </div>
          <div className="flex flex-col items-start">
            <h5 className="font-medium capitalize">
              {direction === 1 ? "completed" : "next"}
            </h5>
            {!selectedFile && (
              <p className="px-2 rounded bg-red-100 text-xs">
                Upload file, please!
              </p>
            )}
          </div>
        </button>
      </div>
      <div className="w-full bg-yellow-200 px-5 py-3 rounded-md flex items-center shadow">
        <AlertCircle className="w-4 h-4 mr-2" />
        <p className="text-sm">
          Please complete until the headers selection is complete first, if you
          experience failure in the process please delete the uploaded file
          <Link
            href={"/inbound/check-product/manifest-inbound"}
            className="mx-1 underline font-semibold"
          >
            here
          </Link>
          first.
        </p>
      </div>
      <div className="w-full relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={direction}
            custom={direction}
            variants={variants}
            initial={variants.enter(direction)}
            animate="center"
            exit={variants.enter(direction)}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {direction === 0 && (
              <div className="p-4 bg-white rounded shadow">
                {!selectedFile ? (
                  <>
                    <h2 className="text-xl font-bold mb-4">Add new files</h2>
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
                          <p>
                            Drag & drop some files here, or click to select
                            files
                          </p>
                          <p className="text-sky-500 text-sm font-semibold">
                            (.xlsx, .xls)
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold mb-4">Selected File</h2>
                      <button
                        className="flex text-sm items-center text-gray-500 hover:underline"
                        type="button"
                        onClick={() => setSelectedFile(null)}
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Change File
                      </button>
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
                  </div>
                )}
              </div>
            )}
            {direction === 1 && (
              <div className="p-4 bg-white rounded shadow flex flex-col gap-6">
                <h2 className="text-xl font-bold">Pick Header</h2>
                {isPendingUpload ||
                isPendingMerge ||
                isSuccessMerge ||
                isErrorUpload ||
                isErrorMerge ? (
                  <div className="w-full flex flex-col border rounded border-gray-500 p-3 h-[300px] items-center justify-center">
                    {isErrorMerge || isErrorUpload ? (
                      <AlertTriangle className="size-6" />
                    ) : (
                      <Loader className="size-6 animate-spin" />
                    )}
                    <p className="text-sm mt-1 ml-2">
                      {isPendingUpload
                        ? "uploading..."
                        : isPendingMerge
                          ? "submiting..."
                          : isErrorUpload
                            ? `Error ${
                                (errorUpload as AxiosError).status
                              }: Failed to upload`
                            : isErrorMerge
                              ? `Error ${
                                  (errorMerge as AxiosError).status
                                }: Failed to merge`
                              : "redirecting..."}
                    </p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col border rounded border-gray-500 p-3">
                    <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-3">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      <div className="flex w-full items-center justify-between">
                        <p>Uploaded File</p>
                        <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                          {results?.code_document?.code_document}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3 py-5">
                      <div className="flex flex-col pl-6 w-full overflow-hidden gap-1">
                        <p className="text-xs font-medium">File Name</p>
                        <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {results?.file_name}
                        </p>
                      </div>

                      <div className="w-1/3 flex-none pl-6 flex gap-2 ">
                        <div className="flex flex-col w-2/3 overflow-hidden gap-1">
                          <p className="text-xs font-medium">Total Columns</p>
                          <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {results?.fileDetails.total_column_count}
                          </p>
                        </div>
                        <div className="flex flex-col w-1/3 overflow-hidden gap-1">
                          <p className="text-xs font-medium">Total Row</p>
                          <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {results?.fileDetails.total_row_count}
                          </p>
                        </div>
                      </div>

                      {/* Tambahan COGS */}
                      {/* <div className="w-[250px] flex flex-col gap-1">
                        <Label className="text-xs font-medium">
                          Select COGS
                        </Label>

                        <Select
                          value={selectedCogs}
                          onValueChange={setSelectedCogs}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose COGS" />
                          </SelectTrigger>

                          <SelectContent>
                            {Cogs?.map((item: any) => (
                              <SelectItem
                                key={item.channel_id}
                                value={String(item.channel_id)}
                              >
                                {item.channel_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div> */}
                    </div>
                    <div className="w-full flex flex-col gap-3 border-b py-5 border-gray-500">
                      <div className="w-[250px] flex flex-col gap-3 pl-6 ">
                        <Label className="text-xs font-medium">
                          Select COGS
                        </Label>

                        <Select
                          value={selectedCogs}
                          onValueChange={setSelectedCogs}
                        >
                          <SelectTrigger className="h-auto">
                            <SelectValue placeholder="Choose COGS" />
                          </SelectTrigger>

                          <SelectContent>
                            {Cogs?.map((item: any) => (
                              <SelectItem
                                key={item.channel_id}
                                value={String(item.channel_id)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {item.channel_name}
                                  </span>

                                  <span className="text-xs text-gray-500">
                                    {item.supplier_name}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="w-full flex">
                      <div className="w-full flex justify-center mt-2 flex-col items-start">
                        <div className="text-sm py-3 font-semibold flex items-center">
                          <div className="w-8 h-8 rounded-full border flex justify-center items-center mr-2 border-black">
                            <Barcode className="w-4 h-4" />
                          </div>
                          Barcode
                        </div>
                        <RadioGroup
                          value={selected.barcode}
                          onValueChange={(e) =>
                            setSelected((prev) => ({ ...prev, barcode: e }))
                          }
                          className="flex w-full flex-col p-1 border border-gray-500 rounded-md border-dashed"
                        >
                          {headers.map((item) => (
                            <Label
                              key={item + "barcode"}
                              htmlFor={item + "barcode"}
                              className={cn(
                                "flex w-full px-5 py-2 gap-2 items-center rounded hover:bg-sky-100",
                                selected.barcode === item &&
                                  "bg-sky-100 hover:bg-sky-200",
                              )}
                            >
                              <RadioGroupItem
                                value={item}
                                id={item + "barcode"}
                              />
                              <p>{item}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="w-full flex justify-center mt-2 flex-col items-start border-l ml-3 pl-3 border-gray-500">
                        <div className="text-sm py-3 font-semibold flex items-center">
                          <div className="w-8 h-8 rounded-full border flex justify-center items-center mr-2 border-black">
                            <FolderEdit className="w-4 h-4" />
                          </div>
                          Product Name
                        </div>
                        <RadioGroup
                          value={selected.name}
                          onValueChange={(e) =>
                            setSelected((prev) => ({ ...prev, name: e }))
                          }
                          className="flex w-full flex-col p-1 border border-gray-500 rounded-md border-dashed"
                        >
                          {headers.map((item) => (
                            <Label
                              key={item + "name"}
                              htmlFor={item + "name"}
                              className={cn(
                                "flex w-full px-5 py-2 gap-2 items-center rounded hover:bg-sky-100",
                                selected.name === item &&
                                  "bg-sky-100 hover:bg-sky-200",
                              )}
                            >
                              <RadioGroupItem value={item} id={item + "name"} />
                              <p>{item}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="w-full flex justify-center mt-2 flex-col items-start border-l ml-3 pl-3 border-gray-500">
                        <div className="text-sm py-3 font-semibold flex items-center">
                          <div className="w-8 h-8 rounded-full border flex justify-center items-center mr-2 border-black">
                            <Disc className="w-4 h-4" />
                          </div>
                          Qty
                        </div>
                        <RadioGroup
                          value={selected.qty}
                          onValueChange={(e) =>
                            setSelected((prev) => ({ ...prev, qty: e }))
                          }
                          className="flex w-full flex-col p-1 border border-gray-500 rounded-md border-dashed"
                        >
                          {headers.map((item) => (
                            <Label
                              key={item + "qty"}
                              htmlFor={item + "qty"}
                              className={cn(
                                "flex w-full px-5 py-2 gap-2 items-center rounded hover:bg-sky-100",
                                selected.qty === item &&
                                  "bg-sky-100 hover:bg-sky-200",
                              )}
                            >
                              <RadioGroupItem value={item} id={item + "qty"} />
                              <p>{item}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="w-full flex justify-center mt-2 flex-col items-start border-l ml-3 pl-3 border-gray-500">
                        <div className="text-sm py-3 font-semibold flex items-center">
                          <div className="w-8 h-8 rounded-full border flex justify-center items-center mr-2 border-black">
                            <Gem className="w-4 h-4" />
                          </div>
                          Price
                        </div>
                        <RadioGroup
                          value={selected.price}
                          onValueChange={(e) =>
                            setSelected((prev) => ({ ...prev, price: e }))
                          }
                          className="flex w-full flex-col p-1 border border-gray-500 rounded-md border-dashed"
                        >
                          {headers.map((item) => (
                            <Label
                              key={item + "price"}
                              htmlFor={item + "price"}
                              className={cn(
                                "flex w-full px-5 py-2 gap-2 items-center rounded hover:bg-sky-100",
                                selected.price === item &&
                                  "bg-sky-100 hover:bg-sky-200",
                              )}
                            >
                              <RadioGroupItem
                                value={item}
                                id={item + "price"}
                              />
                              <p>{item}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
