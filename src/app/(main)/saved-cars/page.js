import { getSavedCars } from "@/actions/car-listing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/dist/server/api-utils";
import UserSavedCarCard from "./_components/UserSavedCarsCard";

const SavedCars = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in?redirect=/saved-cars");

  const savedCars = await getSavedCars();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl font-bold mb-6">Your Saved Cars</h1>
      <UserSavedCarCard initialData ={savedCars} />
    </div>
  );
};
export default SavedCars;
