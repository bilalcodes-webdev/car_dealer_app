import { getAdminUser } from "@/actions/adminAction";
import NotFound from "@/app/not-found";
import Header from "@/components/Header/Header";
import AdminSidebar from "./_components/AdminSideBar";

const AdminLayout = async ({ children }) => {
  const admin = await getAdminUser();

  if (!admin.authorize) {
    return NotFound();
  }
  return (
    <div className="h-full">
      <Header isAdminPage={true} />
      <div className="flex flex-col top-20 h-full w-56 fixed inset-y-0 z-50">
        <AdminSidebar />
      </div>
      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};
export default AdminLayout;
