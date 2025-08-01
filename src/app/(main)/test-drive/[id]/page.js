import { getCarById } from "@/actions/car-listing";
import NotFound from "@/app/not-found";
import TestDriveForm from "./_components/TestDriveForm";


export const generateMetadata = () => {
  title: "Test Drive";
  description: "Book a car for test drive and enjoy your ride";
};

const TestDrivePage = async ({ params }) => {
  const { id } = await params;
  const carDetails = await getCarById(id);


  if (!carDetails.success) return <NotFound />;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl font-bold mb-4">Book a Test Drive</h1>
      <TestDriveForm car={carDetails?.data} testDriveInfo={carDetails?.data?.testDriveInfo} />
    </div>
  );
};
export default TestDrivePage;
