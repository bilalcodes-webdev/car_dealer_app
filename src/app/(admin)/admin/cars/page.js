import CarList from "./_components/CarList";

export const metadata = {
  title: "Cars | Admin Panel",
  description: "Manage cars in the admin dashboard, including viewing, adding, and searching cars.",
};

const CarsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <CarList />
    </div>
  );
};
export default CarsPage;
