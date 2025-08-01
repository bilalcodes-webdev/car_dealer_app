import AddCardForm from "./_components/AddCardForm";

export const metadata = {
  title: "Create Car | Admin Panel",
  description: "Add a new car to the admin dashboard.",
};


const page = () => {
  return (
       <div className="p-6">
         <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
         <AddCardForm />
       </div>
  )
}
export default page