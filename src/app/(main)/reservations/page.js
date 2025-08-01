import { getUserTestDrive } from "@/actions/testDrive";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ReservationsList from "./_components/ReservationsList";

export const metadata = {
  title: "Reservation",
  description: "Manage your test drive reservations",
};

const ReservationPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?/redirect=/reservations");
  }

  const reservationResult = await getUserTestDrive();

  console.log(reservationResult);
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl font-bold mb-4">Your Reservations</h1>
      <ReservationsList initialData={reservationResult} />
    </div>
  );
};
export default ReservationPage;
