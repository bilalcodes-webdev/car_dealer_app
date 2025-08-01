"use server";

import aj from "@/lib/arcjet";
import serilialize from "@/lib/helper";
import db from "@/lib/prisma";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { success } from "zod";

export const getFeaturedCars = async (limit = 3) => {
  try {
    const cars = await db.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!cars) return { success: false, message: "No cars  found" };

    return { success: true, data: cars.map(serilialize) };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const processImageSearchUsingAI = async (file) => {
  console.log(file);
  try {
    const req = await request();

    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          remaining,
          resetInSeconds: reset,
        });
      }

      throw new Error("To many request, please try again later");
    }

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
      Analyze this car image and extract the following information for a search query:
      1. Make (manufacturer)
      2. Body type (SUV, Sedan, Hatchback, etc.)
      3. Color

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "bodyType": "",
        "color": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carData = JSON.parse(cleanedText);

      return { success: true, data: carData };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
