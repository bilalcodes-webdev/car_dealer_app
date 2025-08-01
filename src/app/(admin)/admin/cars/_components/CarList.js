"use client";

import { deleteCar, getCars, updateCar } from "@/actions/carAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/use-fetch-hook";
import { currencyFormat } from "@/lib/helper";
import {
  Badge,
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOffIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import debounce from "lodash/debounce";

const CarList = () => {
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const router = useRouter();

  const updateToastShown = useRef(false);
  const deleteToastShown = useRef(false);

  const {
    isLoading: getCarLoading,
    error: getCarError,
    data: getCarData,
    fn: getCarFn,
  } = useFetch(getCars);

  const {
    isLoading: updateCarLoading,
    error: updateCarError,
    data: updateCarData,
    fn: updateCarFn,
  } = useFetch(updateCar);

  const {
    isLoading: deleteCarLoading,
    error: deleteCarError,
    data: deleteCarData,
    fn: deleteCarFn,
  } = useFetch(deleteCar);

  useEffect(() => {
    getCarFn(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useCallback(
    debounce((query) => {
      getCarFn(query);
    }, 500),
    [getCarFn]
  );

  useEffect(() => {
    debouncedSearch(search);
    return debouncedSearch.cancel;
  }, [search, debouncedSearch]);

  const handleFeaturedCar = async (car) => {
    updateToastShown.current = false;
    await updateCarFn(car.id, { featured: !car.featured });
  };

  const handleStatusUpdate = async (car, status) => {
    updateToastShown.current = false;
    await updateCarFn(car.id, { status });
  };

  useEffect(() => {
    if (
      updateCarData &&
      updateCarData.success &&
      !updateCarLoading &&
      !updateToastShown.current
    ) {
      toast.success("Car updated successfully");
      updateToastShown.current = true;
      getCarFn(search);
    }

    if (updateCarError && !updateToastShown.current) {
      toast.error("Error while updating car");
      updateToastShown.current = true;
    }
  }, [updateCarData, updateCarLoading, updateCarError, search, getCarFn]);

  const handleDeleteCar = async () => {
    if (!carToDelete) return;
    deleteToastShown.current = false;
    await deleteCarFn(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  useEffect(() => {
    if (
      deleteCarData &&
      deleteCarData.success &&
      !deleteCarLoading &&
      !deleteToastShown.current
    ) {
      toast.success("Car deleted successfully");
      deleteToastShown.current = true;
      getCarFn(search);
    }

    if (deleteCarError && !deleteToastShown.current) {
      toast.error("Unable to delete car");
      deleteToastShown.current = true;
    }
  }, [deleteCarData, deleteCarError, search, deleteCarLoading, getCarFn]);

  const getStatusBadge = (status) => {
    const base = "inline-block px-3 py-1 text-sm rounded-full font-medium";

    switch (status) {
      case "AVAILABLE":
        return <span className={`${base} bg-green-100 text-green-800`}>Available</span>;
      case "UNAVAILABLE":
        return <span className={`${base} bg-amber-100 text-amber-800`}>Unavailable</span>;
      case "SOLD":
        return <span className={`${base} bg-blue-100 text-blue-800`}>Sold</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between sm:items-center">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Car
        </Button>

        <form className="flex w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search Car..."
              className="pl-9 w-full sm:w-60"
            />
          </div>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {getCarLoading && !getCarData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
          ) : getCarData?.success && getCarData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCarData.data.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="w-10 h-10 rounded-md overflow-hidden">
                        {car.image?.[0] ? (
                          <Image
                            src={car.image[0]}
                            alt={`${car.make} ${car.model}`}
                            height={40}
                            width={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <CarIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell>{car.make} {car.model}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{currencyFormat(car.price)}</TableCell>
                      <TableCell>{getStatusBadge(car.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => handleFeaturedCar(car)}
                          className="p-0 w-9 h-9"
                          disabled={updateCarLoading}
                        >
                          {car.featured ? (
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOffIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/cars/${car.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            {["AVAILABLE", "UNAVAILABLE", "SOLD"].map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => handleStatusUpdate(car, s)}
                                disabled={car.status === s || updateCarLoading}
                              >
                                {`Set ${s.charAt(0)}${s.slice(1).toLowerCase()}`}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setCarToDelete(car);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No cars found</h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? "No cars match your search criteria"
                  : "Your inventory is empty. Add cars to get started."}
              </p>
              <Button onClick={() => router.push("/admin/cars/create")}>
                Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{carToDelete?.make} {carToDelete?.model}</strong> ({carToDelete?.year})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteCarLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deleteCarLoading}
            >
              {deleteCarLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarList;
