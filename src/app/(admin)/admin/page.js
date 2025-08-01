import { getDashboardData } from "@/actions/adminAction";
import Dashboard from "./_components/Dashboard";


export const metadata = {
  title: "Dashboard | Vehiql Admin",
  description: "Admin dashboard for Vehiql car marketplace",
};

export default async function AdminDashboardPage() {
  // Fetch dashboard data
  const dashboardData = await getDashboardData();

  console.log(dashboardData)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </div>
  );
}