"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge, Filter, Sliders, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CarFilterControl from "./CarFilterControl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CarFilter = ({ filter }) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  
  // GETTING FILTER 
  const currentMakeType = searchParams.get("make") || "";
  const currentBodyType = searchParams.get("bodyType") || "";
  const currentFuelType = searchParams.get("fuelType") || "";
  const currentTransmission = searchParams.get("transmission") || "";
  const currentMinPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice"))
    : filter?.priceRange?.min;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice"))
    : filter?.priceRange?.max;
  const currentSortBy = searchParams.get("sortBy") || "newest";
  
  // States 
  const [make, setMake] = useState(currentMakeType);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [sheetOpen, setSheetOpen] = useState(false);




  useEffect(() => {
    setMake(currentMakeType);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentMakeType,
    currentBodyType,
    currentFuelType,
    currentTransmission,
    currentMinPrice,
    currentMaxPrice,
    currentSortBy,
  ]);

  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currentMinPrice > filter.priceRange.min ||
      currentMaxPrice < filter.priceRange.max,
  ].filter(Boolean).length;


  const currentFileters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRange,
    priceRangeMin: filter.priceRange.min,
    priceRangeMax: filter.priceRange.max,
  };

  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "make":
        setMake(value);
        break;
      case "bodyType":
        setBodyType(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
      default:
        break;
    }
  };

  const handleClearFiler = (filterName) => {
    handleFilterChange(filterName, "");
  };

  const clearAllFilters = () => {
    setMake("");
    setBodyType("");
    setBodyType("");
    setTransmission("");
    setPriceRange([filter.priceRange.min, filter.priceRange.max]);
    setSortBy("newest");

    const params = new URLSearchParams();

    const search = searchParams.get("search");

    if (search) params.set("search", search);

    const query = params.toString();

    const url = query ? `${pathName}?${query}` : pathName;

    router.push(url);
    setSheetOpen(false);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (fuelType) params.set("fuelType", fuelType);
    if (transmission) params.set("transmission", transmission);
    if (priceRange[0] > filter.priceRange.min) {
      params.set("minPrice", priceRange[0].toString());
    }
    if (priceRange[1] < filter.priceRange.max) {
      params.set("maxPrice", priceRange[1].toString());
    }
    if (sortBy !== "newest") params.set("sortBy", sortBy);

    const search = searchParams.get("search");
    const page = searchParams.get("page");
    if (search) params.set("search", search);
    if (page && page !== 1) params.set("page", page);

    const query = params.toString();

    const url = query ? `${pathName}?${query}` : pathName;

    router.push(url);
    setSheetOpen(false);
  };

  return (
    <div className="flex lg:flex-col justify-between gap-4">
      {/* Mobile Filters */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className={"flex items-center gap-2"} variant={"outline"}>
                <Filter className="h-4 w-4" /> Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              className={"w-full sm:max-w-auto overflow-y-auto"}
              side="left"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <div className="py-6">
                  <CarFilterControl
                    filters={filter}
                    currentFileters={currentFileters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFiler}
                  />
                </div>

                <SheetFooter
                  className={
                    "sm:justify-between flex-row pt-2 border-t space-x-4 mx-auto"
                  }
                >
                  <Button
                    type={"button"}
                    variant={"outline"}
                    className={"flex-1"}
                    onClick={clearAllFilters}
                  >
                    Reset
                  </Button>
                  <Button
                    type={"button"}
                    variant={"outline"}
                    className={"flex-1"}
                    onClick={applyFilters}
                  >
                    Show Result
                  </Button>
                </SheetFooter>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sort Selection */}
      <Select
        value={sortBy}
        onValueChange={(value) => {
          setSortBy(value);
          // Apply filters immediately when sort changes
          setTimeout(() => applyFilters(), 0);
        }}
      >
        <SelectTrigger className="w-[180px] lg:w-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {[
            { value: "newest", label: "Newest First" },
            { value: "priceAsc", label: "Price: Low to High" },
            { value: "priceDesc", label: "Price: High to Low" },
          ].map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <Sliders className="mr-2 h-4 w-4" />
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sm text-gray-600"
                onClick={clearAllFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>

          <div className="p-4">
            <CarFilterControl
              filters={filter}
              currentFilters={currentFileters}
              onFilterChange={handleFilterChange}
              onClearFilter={clearAllFilters}
            />
          </div>

          <div className="px-4 py-4 border-t">
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CarFilter;
