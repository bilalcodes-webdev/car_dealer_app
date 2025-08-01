"use server";

import serilialize from "@/lib/helper";
import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { success } from "zod";

export const bookTestDrive = async ({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}) => {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, message: "User not found" };

    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) return { success: false, message: "car not found" };

    const existingBooking = await db.testDriveBooking.findFirst({
      where: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });


    if (existingBooking)
      return { success: false, message: "Slot is already booked" };

    const booking = await db.testDriveBooking.create({
      data: {
        userId: user.id,
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes: notes || "",
        status: "PENDING",
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return { success: true, data: booking };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getUserTestDrive = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, message: "User not found" };

    const bookings = await db.testDriveBooking.findMany({
      where: { userId: user.id },
      include: { Car: true },
      orderBy: { bookingDate: "desc" },
    });

    console.log(bookings)

    const formatedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serilialize(booking.Car),
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return { success: true, data: formatedBookings };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, message: "User not found" };

    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return { success: false, message: "Booking not founf" };

    if (booking.userId !== user.id || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized to cancel this booking",
      };
    }

    if (booking.status === "CANCELED") {
      return { success: false, message: "Bokking is alreay cancelled" };
    }

    if (booking.status === "COMPLETED") {
      return {
        success: false,
        message: "Bokking is completed, unable to cancel",
      };
    }

    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELED" },
    });

    revalidatePath("/reservations");
    revalidatePath("/admin/test-drives");

    return {
      success: true,
      message: "Booking Cancelled Successfully",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
