import { getCarsFilter } from "@/actions/car-listing";
import CarFilter from "./_components/CarFilter";
import AllCarListing from "./_components/AllCarListing";

export const metadata = {
  title: "All Cars",
  description: "Browse and search for your best car",
};
const CarsPage = async () => {
  const filteredCarData = await getCarsFilter();

  return (
    <div className="container max-auto mx-4 my-12">
      <h1 className="text-6xl font-bold mb-4">Browse Car</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* filters */}
        <div className="w-full lg:w-80 shrink-0">
          <CarFilter filter={filteredCarData.data} />
        </div>

        {/* listing */}
        <div className="flex-1">
          <AllCarListing />
        </div>
      </div>
    </div>
  );
};
export default CarsPage;
