"use client";
import { useCallback, useEffect, useState } from "react";

import { Input } from "../ui/input";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch-hook";
import { processCarImageWithAi } from "@/actions/carAction";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageSearchActive, setImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const {
    isLoading: imageSearchLoadig,
    error: imageSearchError,
    data: imageSearchData,
    fn: imageSearchFn,
  } = useFetch(processCarImageWithAi);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (imageSearchActive && searchImage) {
      // Image search logic here
      await imageSearchFn(searchImage);
      toast.success("Image search triggered");
    } else if (searchTerm.trim()) {
      // Text search logic here
      router.push(`/cars/?search=${encodeURIComponent(searchTerm)}`);
      console.log("Performing text search", searchTerm);
      toast.success("Text search triggered");
    } else {
      toast.error("Please enter text or upload an image");
    }
  };

  useEffect(() => {
    if (imageSearchData?.success && !imageSearchLoadig) {
      const params = new URLSearchParams();

      console.log(imageSearchData)
      if (imageSearchData.data.make)
        params.set("make", imageSearchData.data.make);
      if (imageSearchData.data.bodyType)
        params.set("bodyType", imageSearchData.data.bodyType);
      if (imageSearchData.data.make)
        params.set("color", imageSearchData.data.color);

      router.push(`/cars?${params.toString()}`);
    }

    if (imageSearchError) {
      toast.error("Search Failed Try Again");
    }
  }, [imageSearchData, imageSearchLoadig, imageSearchError]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5mb");
      return;
    }

    setIsUploading(true);
    setSearchImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
      setIsUploading(false);
      toast.success("Image Upload Successfully");
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Image Upload Failed");
    };

    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [],
        "image/png": [],
        "image/jpg": [],
      },
      maxFiles: 1,
    });

  return (
    <div>
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Make, model or image"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="placeholder:text-xs sm:placeholder:text-normal pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-md"
          />
          <div className="absolute right-[100px]">
            <Camera
              size={35}
              className="p-2 rounded-xl cursor-pointer"
              onClick={() => setImageSearchActive(!imageSearchActive)}
              style={{
                background: imageSearchActive ? "black" : "",
                color: imageSearchActive ? "white" : "",
              }}
            />
          </div>
          <Button
            onClick={() => handleSearch}
            type="submit"
            className="absolute right-2 rounded-full"
          >
            Search
          </Button>
        </div>

        {imageSearchActive && (
          <div className="mt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center">
              {imagePreview ? (
                <div className="flex items-center flex-col">
                  <img
                    src={imagePreview}
                    alt="Car Image"
                    className="h-40 object-contain mb-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImagePreview("");
                      setSearchImage(null);
                      toast.info("Image Removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className="flex items-center flex-col">
                    <Upload className="h-12 w-12 text-gray-500 mb-2" />
                    <p className="text-gray-400 mb-4">
                      {isDragActive && !isDragReject
                        ? "Leave the files here to upload"
                        : "Drag & Drop Car Image Here"}
                    </p>
                    {isDragReject && (
                      <p className="mb-2 text-red-500">Invalid Image</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Only Supported: JPEG, JPG, PNG (Max File Size: 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imagePreview && (
              <Button disabled={imageSearchLoadig} type="submit" className="w-full mt-3" variant="outline">
                {isUploading && "Uploading"}
                {imageSearchLoadig ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...{" "}
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default HomeSearch;
