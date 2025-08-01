// ...TOP IMPORTS SAME AS BEFORE (unchanged)...
"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch-hook";
import { addCar, processCarImageWithAi } from "@/actions/carAction";
import { useRouter } from "next/navigation";

// Predefined options
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const AddCardForm = () => {
  const [activeTab, setActiveTab] = useState("ai");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("");

  // ZOD SCHEMA
  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z
      .string()
      .min(1, "Price is required")
      .refine((val) => {
        const price = parseFloat(val);
        return !isNaN(price) && price;
      }),
    mileage: z
      .string()
      .min(1, "Mileage is required")
      .refine((val) => {
        const mileage = parseInt(val);
        return !isNaN(mileage) && mileage;
      }),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false),
  });

  // USE FORM HOOK
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedAiImages, setUploadAiImage] = useState(null);

  const router = useRouter();
  //Server Action For Adding Car
  const { isLoading, error, data, fn } = useFetch(addCar);

  //Server Action For Adding Car With Ai
  const {
    isLoading: aiLoading,
    error: aiError,
    data: aiData,
    fn: Aifn,
  } = useFetch(processCarImageWithAi);

  const onAiImageUploadhandler = async () => {
    if (!uploadedAiImages) {
      toast.error("Please uplaod image first");
      return;
    }
    await Aifn(uploadedAiImages);
  };

  useEffect(() => {
    if (aiData && aiData.success && !aiLoading) {
      const {
        bodyType,
        color,
        confidence,
        description,
        fuelType,
        make,
        mileage,
        price,
        model,
        transmission,
        year,
      } = aiData.data;

      const cleanedPrice = price.replace(/[$,]/g, "");


      setValue("bodyType", bodyType);
      setValue("color", color);
      setValue("confidence", confidence);
      setValue("description", description);
      setValue("fuelType", fuelType);
      setValue("make", make);
      setValue("mileage", mileage);
      setValue("price", cleanedPrice);
      setValue("model", model);
      setValue("transmission", transmission);
      setValue("year", year);

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(uploadedAiImages);

      toast.success("Successfully extracted car details", {
        description: `Detected ${year} ${make} ${model} with ${Math.round(
          confidence * 100
        )}% confidence`,
      });

      // Switch to manual tab for the user to review and fill in missing details
      setActiveTab("manual");
    }
  }, [aiData, aiLoading, setValue, uploadedAiImages]);

  useEffect(() => {
    if (aiError) {
      toast.error(aiError || "Something Went Wrong");
    }
  }, [aiError]);

  // Using Form Inputs
  const onMultiImagesDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        // Replace with toast.error if using toast
        console.error(`${file.name} exceeds 5MB`);
        toast.error(`${file.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === validFiles.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success("Image Upload Successfully");
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  //AI Image
  const onAiDropImage = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5mb");
      return;
    }

    setUploadAiImage(file);

    const reader = new FileReader();

    reader.onloadend = (e) => {
      setImagePreview(e.target.result);
      toast.success("Image Upload Successfully");
    };

    reader.readAsDataURL(file);
  }, []);

  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDropImage,
      accept: {
        "image/jpeg": [],
        "image/png": [],
        "image/jpg": [],
        "image/.webp": [],
      },
      maxFiles: 1,
    });

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast.error("Image Removed Successfully");
  };

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError("Please upload at least one image");
      return;
    }

    const carData = {
      ...data,
      seats: data.seats ? parseInt(data.seats) : null,
    };

    await fn({ carData, images: uploadedImages });
  };

  useEffect(() => {
    if (data && data.success && !isLoading) {
      toast.success("Car Added Successfully");
      router.push("/admin/cars");
    }
  }, [data, isLoading, router]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Something Went Wrong");
    }
  }, [error]);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>Enter the details of the car.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Text Inputs */}
                  {[
                    { name: "make", label: "Make", placeholder: "e.g. Toyota" },
                    {
                      name: "model",
                      label: "Model",
                      placeholder: "e.g. Camry",
                    },
                    { name: "year", label: "Year", placeholder: "e.g. 2022" },
                    {
                      name: "price",
                      label: "Price ($)",
                      placeholder: "e.g. 25000",
                    },
                    {
                      name: "mileage",
                      label: "Mileage",
                      placeholder: "e.g. 15000",
                    },
                    { name: "color", label: "Color", placeholder: "e.g. Blue" },
                    {
                      name: "seats",
                      label: "Seats (Optional)",
                      placeholder: "e.g. 5",
                    },
                  ].map(({ name, label, placeholder }) => (
                    <div key={name} className="space-y-2">
                      <Label htmlFor={name}>{label}</Label>
                      <Input
                        id={name}
                        {...register(name)}
                        placeholder={placeholder}
                        className={errors[name] ? "border-red-500" : ""}
                      />
                      {errors[name] && (
                        <p className="text-xs text-red-500">
                          {errors[name].message}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Selects with full width */}
                  <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select
                      onValueChange={(val) => setValue("fuelType", val)}
                      defaultValue={getValues("fuelType")}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          errors.fuelType ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select
                      onValueChange={(val) => setValue("transmission", val)}
                      defaultValue={getValues("transmission")}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          errors.transmission ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Body Type</Label>
                    <Select
                      onValueChange={(val) => setValue("bodyType", val)}
                      defaultValue={getValues("bodyType")}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          errors.bodyType ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      onValueChange={(val) => setValue("status", val)}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter car description..."
                    className={`min-h-32 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-start space-x-3 border p-4 rounded-md">
                  <Checkbox
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => setValue("featured", checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="featured">Feature this car</Label>
                    <p className="text-sm text-gray-500">
                      Will appear on homepage
                    </p>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className={imageError ? "text-red-500" : ""}>
                    Images{" "}
                    {imageError && <span className="text-red-500">*</span>}
                  </Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed p-6 text-center rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                      imageError ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-gray-500">
                      (JPG, PNG, WebP – max 5MB)
                    </p>
                  </div>
                  {imageError && (
                    <p className="text-xs text-red-500">{imageError}</p>
                  )}
                </div>

                {/* Preview Images */}
                {uploadedImages.length > 0 && (
                  <>
                    <div className="my-2 text-sm font-bold capitalize">
                      Uploaded Images : ({uploadedImages.length})
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Uploaded ${index + 1}`}
                            width={100}
                            height={100}
                            className="cursor-pointer w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full md:w-auto px-2"
                  disabled={isLoading}
                >
                  {!isLoading ? (
                    "Add Car"
                  ) : (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Adding Car...
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Powered Card Details Extraction</CardTitle>
              <CardDescription>
                <p>
                  {" "}
                  Upload an image of a car and let AI do the work to extract
                  information
                </p>
                <span className="text-red-500 text-xs">
                  Sometime It will take time when AI overloaded
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center border-2 border-dashed rounded-lg p-6">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="ai-image"
                      className="max-h-56 max-w-full object-contain mb-4 "
                    />
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <Button
                        variant={"destructive"}
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => {
                          setImagePreview(null), setUploadAiImage(null);
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={onAiImageUploadhandler}
                        disabled={aiLoading}
                        variant={"outline"}
                        className="px-4 py-2 cursor-pointe bg-blue-600 hover:bg-blue-800 text-white hover:text-white transition-all"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-1" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-1" /> Extract Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer p-4 hover:bg-gray-100 transition-all"
                    {...getAiRootProps()}
                  >
                    <input {...getAiInputProps()} />
                    <div className="flex items-center flex-col">
                      <Camera className="h-12 w-12 text-gray-500 mb-2" />
                      <p className="text-gray-500 text-sm mb-4">
                        Drag & Drop Car Image Here
                      </p>

                      <p className="text-gray-500 text-xs">
                        Only Supported: JPEG, JPG, PNG, WEBP (Max File Size:
                        5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">How it works</h3>
                <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                  <li>Upload a clear image of the car</li>
                  <li>Click Extract Details to analyze with Gemini AI</li>
                  <li>Review the extracted information</li>
                  <li>Fill in any missing details manually</li>
                  <li>Add the car to your inventory</li>
                </ol>
              </div>

              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="font-medium text-amber-800 mb-1">
                  Tips for best results
                </h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• Use clear, well-lit images</li>
                  <li>• Try to capture the entire vehicle</li>
                  <li>• For difficult models, use multiple views</li>
                  <li>• Always verify AI-extracted information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddCardForm;
