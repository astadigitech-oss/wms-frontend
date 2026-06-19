"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { alertError, cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import { Check, ChevronsUpDown, Info, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  useGetBrandOptionsCargo,
  useGetCategoryOptionsCargo,
  useGetConditionOptionsCargo,
  useGetOriginOptionsCargo,
  useGetPackageConditionOptionsCargo,
  useSetInfoCargo,
} from "../_api";

type Option = {
  value: string;
  label: string;
};

type InfoInput = {
  brand_id: string;
  category_id: string;
  product_condition_id: string;
  package_condition_id: string;
  origin_product_id: string;
};

const normalizeValue = (value?: string | number | null) =>
  value === undefined || value === null ? "" : String(value);

const getOptionLabel = (item: any) =>
  item?.name ??
  item?.label ??
  item?.title ??
  item?.category ??
  item?.brand ??
  item?.condition ??
  item?.status ??
  item?.warehouse ??
  item?.value ??
  "-";

const getOptionValue = (item: any) =>
  normalizeValue(item?.id ?? item?.value ?? item?.name ?? item);

const getOptionList = (data: any): Option[] => {
  const resource =
    data?.data?.data?.resource?.data ??
    data?.data?.data?.resource ??
    data?.data?.data ??
    data?.data ??
    [];
  const list = Array.isArray(resource) ? resource : [];

  return list.map((item) => ({
    value: getOptionValue(item),
    label: String(getOptionLabel(item)),
  }));
};

const getCurrentValue = (cargo: any, keys: string[]) => {
  for (const key of keys) {
    const value = key.split(".").reduce((acc, part) => acc?.[part], cargo);
    if (value !== undefined && value !== null && value !== "") {
      return normalizeValue(value);
    }
  }

  return "";
};

const getCurrentLabel = (cargo: any, keys: string[]) => {
  for (const key of keys) {
    const value = key.split(".").reduce((acc, part) => acc?.[part], cargo);
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return "";
};

const mergeCurrentOption = (
  options: Option[],
  value: string,
  label: string,
) => {
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [
    {
      value,
      label: label || value,
    },
    ...options,
  ];
};

const SelectInfo = ({
  label,
  value,
  placeholder,
  options,
  disabled,
  isLoading,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Option[];
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-10 w-full justify-between border-sky-400/80 px-3 font-normal hover:bg-sky-50"
          >
            <span className="truncate">
              {selected?.label ?? placeholder}
            </span>
            {isLoading ? (
              <Loader2 className="ml-2 size-4 shrink-0 animate-spin opacity-70" />
            ) : (
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No Data Found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${label}-${option.value}`}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const DialogSetInfo = ({
  open,
  onOpenChange,
  cargoId,
  cargo,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargoId: any;
  cargo: any;
  onSuccess: () => void;
}) => {
  const [input, setInput] = useState<InfoInput>({
    brand_id: "",
    category_id: "",
    product_condition_id: "",
    package_condition_id: "",
    origin_product_id: "",
  });

  const brandQuery = useGetBrandOptionsCargo({ enabled: open });
  const categoryQuery = useGetCategoryOptionsCargo({ enabled: open });
  const conditionQuery = useGetConditionOptionsCargo({ enabled: open });
  const packageConditionQuery = useGetPackageConditionOptionsCargo({
    enabled: open,
  });
  const originQuery = useGetOriginOptionsCargo({ enabled: open });
  const { mutate: setInfoCargo, isPending } = useSetInfoCargo();

  const brandOptions = useMemo(
    () =>
      mergeCurrentOption(
        getOptionList(brandQuery.data),
        input.brand_id,
        getCurrentLabel(cargo, ["brand.name", "brand_name", "merk", "brand"]),
      ),
    [brandQuery.data, cargo, input.brand_id],
  );
  const categoryOptions = useMemo(
    () =>
      mergeCurrentOption(
        getOptionList(categoryQuery.data),
        input.category_id,
        getCurrentLabel(cargo, [
          "category.name",
          "category_name",
          "category_product",
          "category",
        ]),
      ),
    [categoryQuery.data, cargo, input.category_id],
  );
  const conditionOptions = useMemo(
    () =>
      mergeCurrentOption(
        getOptionList(conditionQuery.data),
        input.product_condition_id,
        getCurrentLabel(cargo, [
          "product_condition.name",
          "product_condition_name",
          "condition_product",
          "product_condition",
        ]),
      ),
    [conditionQuery.data, cargo, input.product_condition_id],
  );
  const packageConditionOptions = useMemo(
    () =>
      mergeCurrentOption(
        getOptionList(packageConditionQuery.data),
        input.package_condition_id,
        getCurrentLabel(cargo, [
          "package_condition.name",
          "package_condition_name",
          "condition_package",
          "package_condition",
          "status",
        ]),
      ),
    [packageConditionQuery.data, cargo, input.package_condition_id],
  );
  const originOptions = useMemo(
    () =>
      mergeCurrentOption(
        getOptionList(originQuery.data),
        input.origin_product_id,
        getCurrentLabel(cargo, [
          "origin_product.name",
          "origin_product_name",
          "warehouse.name",
          "warehouse_name",
          "asal_product",
          "origin_product",
        ]),
      ),
    [originQuery.data, cargo, input.origin_product_id],
  );

  const isLoadingOptions =
    brandQuery.isPending ||
    brandQuery.isRefetching ||
    categoryQuery.isPending ||
    categoryQuery.isRefetching ||
    conditionQuery.isPending ||
    conditionQuery.isRefetching ||
    packageConditionQuery.isPending ||
    packageConditionQuery.isRefetching ||
    originQuery.isPending ||
    originQuery.isRefetching;

  const isDisabled = isPending || isLoadingOptions;
  const isComplete = Object.values(input).every((value) => value.trim());

  useEffect(() => {
    if (!open) return;

    setInput({
      brand_id: getCurrentValue(cargo, ["brand.id", "brand_id", "merk_id"]),
      category_id: getCurrentValue(cargo, ["category.id", "category_id"]),
      product_condition_id: getCurrentValue(cargo, [
        "product_condition.id",
        "product_condition_id",
        "condition_product_id",
      ]),
      package_condition_id: getCurrentValue(cargo, [
        "package_condition.id",
        "package_condition_id",
        "condition_package_id",
        "status_id",
      ]),
      origin_product_id: getCurrentValue(cargo, [
        "origin_product.id",
        "origin_product_id",
        "warehouse.id",
        "warehouse_id",
        "asal_product_id",
      ]),
    });
  }, [cargo, open]);

  useEffect(() => {
    alertError({
      isError: brandQuery.isError,
      error: brandQuery.error as AxiosError,
      data: "Data Merk",
      action: "get data",
      method: "GET",
    });
  }, [brandQuery.isError, brandQuery.error]);

  useEffect(() => {
    alertError({
      isError: categoryQuery.isError,
      error: categoryQuery.error as AxiosError,
      data: "Data Category",
      action: "get data",
      method: "GET",
    });
  }, [categoryQuery.isError, categoryQuery.error]);

  useEffect(() => {
    alertError({
      isError: conditionQuery.isError,
      error: conditionQuery.error as AxiosError,
      data: "Data Kondisi Product",
      action: "get data",
      method: "GET",
    });
  }, [conditionQuery.isError, conditionQuery.error]);

  useEffect(() => {
    alertError({
      isError: packageConditionQuery.isError,
      error: packageConditionQuery.error as AxiosError,
      data: "Data Kondisi Paket",
      action: "get data",
      method: "GET",
    });
  }, [packageConditionQuery.isError, packageConditionQuery.error]);

  useEffect(() => {
    alertError({
      isError: originQuery.isError,
      error: originQuery.error as AxiosError,
      data: "Data Asal Product",
      action: "get data",
      method: "GET",
    });
  }, [originQuery.isError, originQuery.error]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isComplete || isPending) return;

    setInfoCargo(
      {
        id: cargoId,
        body: input,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Set Info Cargo
            <TooltipProviderPage value="Close" side="left">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-7 items-center justify-center rounded-full border border-black hover:bg-gray-100"
                disabled={isPending}
              >
                <X className="size-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription>
            Pilih merk, category, kondisi product, kondisi paket, dan asal
            product.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInfo
              label="Merk"
              value={input.brand_id}
              placeholder="Select merk"
              options={brandOptions}
              disabled={isDisabled}
              isLoading={brandQuery.isPending || brandQuery.isRefetching}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, brand_id: value }))
              }
            />
            <SelectInfo
              label="Category"
              value={input.category_id}
              placeholder="Select category"
              options={categoryOptions}
              disabled={isDisabled}
              isLoading={categoryQuery.isPending || categoryQuery.isRefetching}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, category_id: value }))
              }
            />
            <SelectInfo
              label="Kondisi Product"
              value={input.product_condition_id}
              placeholder="Select kondisi product"
              options={conditionOptions}
              disabled={isDisabled}
              isLoading={conditionQuery.isPending || conditionQuery.isRefetching}
              onChange={(value) =>
                setInput((prev) => ({
                  ...prev,
                  product_condition_id: value,
                }))
              }
            />
            <SelectInfo
              label="Kondisi Paket"
              value={input.package_condition_id}
              placeholder="Select kondisi paket"
              options={packageConditionOptions}
              disabled={isDisabled}
              isLoading={
                packageConditionQuery.isPending ||
                packageConditionQuery.isRefetching
              }
              onChange={(value) =>
                setInput((prev) => ({
                  ...prev,
                  package_condition_id: value,
                }))
              }
            />
            <div className="sm:col-span-2">
              <SelectInfo
                label="Asal Product"
                value={input.origin_product_id}
                placeholder="Select asal product"
                options={originOptions}
                disabled={isDisabled}
                isLoading={originQuery.isPending || originQuery.isRefetching}
                onChange={(value) =>
                  setInput((prev) => ({
                    ...prev,
                    origin_product_id: value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="liquid" disabled={!isComplete || isDisabled}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Info className="size-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSetInfo;
