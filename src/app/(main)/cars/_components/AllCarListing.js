"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getCars } from "@/actions/car-listing";
import useFetch from "@/hooks/use-fetch-hook";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CarListingLoading from "./CarListingLoading ";
import CarCard from "./CarCard";

const AllCarListing = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const limit = 6;
  const page = parseInt(searchParams.get("page") || "1");

  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";

  const { isLoading, error, data, fn } = useFetch(getCars);

  console.log(data)

  // Fetch data on param change
  useEffect(() => {
    fn({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [searchParams.toString()]); // triggers fetch on any search param change

  // Update page in URL
  const goToPage = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPaginationUrl = (pageNum) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (isLoading && !data?.success) {
    return <CarListingLoading />;
  }

  if (!data && !data?.data) {
    return null;
  }

  if (error || (data && !data?.success)) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cars. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (data?.data?.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No cars found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We could not find any cars matching your search criteria. Try
          adjusting your filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  // Pagination setup
  const visiblePageNumbers= [1];
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(data?.pagination.pages - 1, page + 1);
    i++
  ) {
    visiblePageNumbers.push(i);
  }
  if (data?.pagination.pages > 1) {
    visiblePageNumbers.push(data?.pagination.pages);
  }
  const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort((a, b) => a - b);

  const paginationItems = [];
  let lastPage = 0;
  uniquePageNumbers.forEach((p) => {
    if (p - lastPage > 1) {
      paginationItems.push(
        <PaginationItem key={`ellipsis-${p}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    paginationItems.push(
      <PaginationItem key={p}>
        <PaginationLink
          href={getPaginationUrl(p)}
          isActive={p === page}
          onClick={(e) => {
            e.preventDefault();
            goToPage(p);
          }}
        >
          {p}
        </PaginationLink>
      </PaginationItem>
    );

    lastPage = p;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(page - 1) * limit + 1}-
            {Math.min(page * limit, data?.pagination?.total)}
          </span>{" "}
          of <span className="font-medium">{data?.pagination?.total}</span> cars
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {data?.pagination.pages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={getPaginationUrl(page - 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) goToPage(page - 1);
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {paginationItems}

            <PaginationItem>
              <PaginationNext
                href={getPaginationUrl(page + 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < data?.pagination.pages) goToPage(page + 1);
                }}
                className={
                  page >= data?.pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AllCarListing;
