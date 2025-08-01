"use server";

import serilialize from "@/lib/helper";
import db from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { includes, success } from "zod";

// export const processCarImageWithAi = async (file) => {
//   try {
//     if (!process.env.GEMINI_API_KEY) {
//       throw new Error("Gemini Api Key Error or Invalid");
//     }

//     const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//     const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const arrayBuffer = await file.arrayBuffer();

//     const buffer = Buffer.from(arrayBuffer).toString("base64");

//     const imagePart = {
//       inlineData: {
//         data: buffer,
//         mimeType: file.type,
//       },
//     };

//     const prompt = `
//       Analyze this car image and extract the following information:
//       1. Make (manufacturer)
//       2. Model
//       3. Year (approximately)
//       4. Color
//       5. Body type (SUV, Sedan, Hatchback, etc.)
//       6. Mileage
//       7. Fuel type (your best guess)
//       8. Transmission type (your best guess)
//       9. Price (your best guess)
//       9. Short Description as to be added to a car listing

//       Format your response as a clean JSON object with these fields:
//       {
//         "make": "",
//         "model": "",
//         "year": 0000,
//         "color": "",
//         "price": "",
//         "mileage": "",
//         "bodyType": "",
//         "fuelType": "",
//         "transmission": "",
//         "description": "",
//         "confidence": 0.0
//       }

//     //   For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
//     //   Only respond with the JSON object, nothing else.
//     // `;

//     const result = await model.generateContent([imagePart, prompt]);

//     const response = await result.response;

//     console.log(response)

//     const text = response.text();

//     const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

//     try {
//       const carDetails = JSON.parse(cleanedText);

//       // Validate the response format
//       const requiredFields = [
//         "make",
//         "model",
//         "year",
//         "color",
//         "bodyType",
//         "price",
//         "mileage",
//         "fuelType",
//         "transmission",
//         "description",
//         "confidence",
//       ];

//       const missingFields = requiredFields.filter(
//         (field) => !(field in carDetails)
//       );

//       if (missingFields.length > 0) {
//         throw new Error(
//           `AI response missing required fields: ${missingFields.join(", ")}`
//         );
//       }

//       // Return success response with data
//       return {
//         success: true,
//         data: carDetails,
//       };
//     } catch (parseError) {
//       console.error("Failed to parse AI response:", parseError);
//       console.log("Raw response:", text);
//       return {
//         success: false,
//         error: "Failed to parse AI response",
//       };
//     }
//   } catch (error) {
//     console.error();
//     throw new Error("Gemini API error:" + error.message);
//   }
// };

export const processCarImageWithAi = async (file) => {
  const maxRetries = 3;
  const retryDelay = 1000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini Api Key Error or Invalid");
      }

      const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer).toString("base64");

      const imagePart = {
        inlineData: {
          data: buffer,
          mimeType: file.type,
        },
      };

      const prompt = `
        Analyze this car image and extract the following information:
        1. Make (manufacturer)
        2. Model
        3. Year (approximately)
        4. Color
        5. Body type (SUV, Sedan, Hatchback, etc.)
        6. Mileage
        7. Fuel type (your best guess)
        8. Transmission type (your best guess)
        9. Price (your best guess)
        10. Short Description as to be added to a car listing

        Format your response as a clean JSON object with these fields:
        {
          "make": "",
          "model": "",
          "year": 0000,
          "color": "",
          "price": "",
          "mileage": "",
          "bodyType": "",
          "fuelType": "",
          "transmission": "",
          "description": "",
          "confidence": 0.0
        }

        Only respond with the JSON object, nothing else.
      `;

      const result = await model.generateContent([imagePart, prompt]);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      try {
        const carDetails = JSON.parse(cleanedText);

        const requiredFields = [
          "make",
          "model",
          "year",
          "color",
          "bodyType",
          "price",
          "mileage",
          "fuelType",
          "transmission",
          "description",
          "confidence",
        ];

        const missingFields = requiredFields.filter(
          (field) => !(field in carDetails)
        );

        if (missingFields.length > 0) {
          throw new Error(
            `AI response missing required fields: ${missingFields.join(", ")}`
          );
        }

        return {
          success: true,
          data: carDetails,
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.log("Raw response:", text);
        return {
          success: false,
          error: "Failed to parse AI response",
        };
      }
    } catch (error) {
      // Retry if Gemini model is overloaded
      if (error.message.includes("503") && attempt < maxRetries) {
        console.warn(
          `Gemini is overloaded. Retrying attempt ${attempt} of ${maxRetries}...`
        );
        await new Promise((res) => setTimeout(res, retryDelay));
        continue;
      }

      // Log & return final error after retries
      console.error("Gemini AI error:", error);
      throw new Error("Gemini API error: " + error.message);
    }
  }
};

// Add a car to the database with images
export async function addCar({ carData, images }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const carId = uuidv4();
    const folderPath = `cars/${carId}`;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        continue;
      }

      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage
        .from("cars")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        return {
          success: false,
          message: `Failed to upload image: ${error.message}`,
        };
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cars/${filePath}`;
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      return { success: false, message: "No valid images were uploaded" };
    }

    const existingCar = await db.car.findFirst({
      where: {
        make: carData.make,
        model: carData.model,
      },
    });

    if (existingCar) {
      return {
        success: false,
        message: "Car already exists with the same make and model",
      };
    }

    const car = await db.car.create({
      data: {
        id: carId,
        make: carData.make,
        model: carData.model,
        year: parseInt(carData.year),
        price: parseFloat(carData.price),
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        image: imageUrls,
      },
    });

    revalidatePath("/admin/cars");

    return {
      success: true,
      message: "Car added successfully",
      data: car,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong while adding the car",
    };
  }
}

export async function getCars(search = "") {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, message: "User not found" };
    const where = {};

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const car = await db.car.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedCars = car.map(serilialize);

    return { success: true, data: serializedCars };
  } catch (error) {
    return { success: false, message: error?.message };
  }
}

export async function deleteCar(carId) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, message: "User not found" };

    const findCar = await db.car.findUnique({
      where: {
        id: carId,
      },
      select: {
        image: true,
      },
    });

    console.log(findCar);
    if (!findCar) return { success: false, message: "Car not found" };

    // Delete the car from the database
    await db.car.delete({
      where: { id: carId },
    });

    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      // Extract file paths from image URLs
      const filePaths = findCar.image
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/cars\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      // Delete files from storage if paths were extracted
      if (filePaths.length > 0) {
        const { error } = await supabase.storage.from("cars").remove(filePaths);

        if (error) {
          console.error("Error deleting images:", error);
          // We continue even if image deletion fails
        }
      }
    } catch (error) {
      console.error("Error with storage operations:", storageError);
    }

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateCar(carId, { status, featured }) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, message: "User not found" };

    const updatedData = {};

    if (status !== undefined) updatedData.status = status;
    if (featured !== undefined) updatedData.featured = featured;

    if (!carId) return { success: false, message: "Missing carId" };

    const updateCar = await db.car.update({
      where: { id: carId },
      data: updatedData,
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
