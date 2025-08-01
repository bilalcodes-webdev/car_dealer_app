"use server";

import serilialize from "@/lib/helper";
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getCarsFilter = async () => {
  try {
    const makes = await db.car.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: { make: true },
      distinct: ["make"],
      orderBy: {
        make: "asc",
      },
    });
    const bodyTypes = await db.car.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: {
        make: "asc",
      },
    });
    const fuelTypes = await db.car.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: { fuelType: true },
      distinct: ["fuelType"],
      orderBy: {
        make: "asc",
      },
    });
    const transmissions = await db.car.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: { transmission: true },
      distinct: ["transmission"],
      orderBy: {
        make: "asc",
      },
    });

    const priceAggregation = await db.car.aggregate({
      where: { status: "AVAILABLE" },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return {
      success: true,
      data: {
        makes: makes.map((item) => item.make),
        bodyTypes: bodyTypes.map((item) => item.bodyType),
        fuelTypes: fuelTypes.map((item) => item.fuelType),
        transmissions: transmissions.map((item) => item.transmission),
        priceRange: {
          min: priceAggregation._min
            ? parseFloat(priceAggregation._min.price.toString())
            : 0,
          max: priceAggregation._max
            ? parseFloat(priceAggregation._max.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCars = async ({
  search = "",
  make = "",
  bodyType = "",
  fuelType = "",
  transmission = "",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = "newest",
  page = 1,
  limit = 6,
}) => {
  try {
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    let where = {
      status: "AVAILABLE",
    };

    if (search) {
      where.OR = [
        { make: { contain: search, mode: "insensitive" } },
        { model: { contain: search, mode: "insensitive" } },
        { description: { contain: search, mode: "insensitive" } },
      ];
    }

    if (make) where.make = { equals: make, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };

    where.price = {
      gte: parseFloat(minPrice) || 0,
    };

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    let orderBy = {};

    switch (sortBy) {
      case "priceAsc":
        orderBy = { price: "asc" };
        break;
      case "priceDesc":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const totalCars = await db.car.count({ where });

    const cars = await db.car.findMany({
      where,
      take: limit,
      skip,
      orderBy,
    });

    let wishlisted = new Set();

    if (dbUser) {
      const saveCars = await db.userSaveCar.findMany({
        where: { userId: dbUser.id },
        select: { carId: true },
      });

      wishlisted = new Set(saveCars.map((car) => car.id));
    }

    const serializedCars = cars.map((car) =>
      serilialize(car, wishlisted.has(car.id))
    );

    return {
      success: true,
      data: serializedCars,
      pagination: {
        total: totalCars,
        page,
        limit,
        pages: Math.ceil(totalCars / limit),
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const toggleSavedCar = async (carId) => {
  try {
    const { userId } = await auth();

    if (!userId)
      return { success: false, message: "User is not authenticated" };

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) return { success: false, message: "User not found" };

    const car = await db.car.findUnique({
      where: {
        id: carId,
      },
    });

    if (!car) return { success: false, message: "Car not found" };

    const existingSave = await db.userSaveCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    // If the car is already saved, remove it and return
    if (existingSave) {
      await db.userSaveCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });

      revalidatePath("/");
      revalidatePath("/save-cars");
      return {
        success: true,
        saved: false,
        message: "Car removed from favourites",
      };
    }

    // If not saved, create a new save
    await db.userSaveCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    revalidatePath("/save-cars");
    return {
      success: true,
      saved: true,
      message: "Car added to favourites",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export async function getSavedCars() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get saved cars with their details
    const savedCars = await db.userSaveCar.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { savedAt: "desc" },
    });

    // Extract and format car data
    const cars = savedCars.map((saved) => serilialize(saved.car));

    return {
      success: true,
      data: cars,
    };
  } catch (error) {
    console.error("Error fetching saved cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}


export async function getCarById(carId) {
  try {
    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Get car details
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if car is wishlisted by user
    let isWishlisted = false;
    if (dbUser) {
      const savedCar = await db.userSaveCar.findUnique({
        where: {
          userId_carId: {
            userId: dbUser.id,
            carId,
          },
        },
      });

      isWishlisted = !!savedCar;
    }

    // Check if user has already booked a test drive for this car
    const existingTestDrive = await db.testDriveBooking.findFirst({
      where: {
        carId,
        userId: dbUser.id,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let userTestDrive = null;

    if (existingTestDrive) {
      userTestDrive = {
        id: existingTestDrive.id,
        status: existingTestDrive.status,
        bookingDate: existingTestDrive.bookingDate.toISOString(),
      };
    }

    // Get dealership info for test drive availability
    const dealership = await db.dealerShipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    return {
      success: true,
      data: {
        ...serilialize(car, isWishlisted),
        testDriveInfo: {
          userTestDrive,
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
                workingHours: dealership.workingHours.map((hour) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
  } catch (error) {
    throw new Error("Error fetching car details:" + error.message);
  }
}

