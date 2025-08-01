"use client";

import { cn } from "@/lib/utils";
import { Calendar, Car, Cog, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Cars",
    icon: Car,
    href: "/admin/cars",
  },
  {
    label: "Test Drives",
    icon: Calendar,
    href: "/admin/test-drives",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  return (
    <>
      <div className="hidden md:flex h-full flex-col overflow-y-auto shadow-sm border-r bg-white">
        {routes.map((route) => {
          return (
            <Link
              key={route.label}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-800 hover:bg-slate-100/50 h-16",
                pathname === route.href
                  ? "text-blue-500 bg-blue-100/50 hover:bg-blue-100 hover:text-blue-700"
                  : ""
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          );
        })}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16">
        {routes.map((route) => {
          return (
            <Link
              key={route.label}
              href={route.href}
              className={cn(
                "flex items-center  flex-col justify-centertext-xs text-slate-500 font-mediumtransition-all p-1 flex-1 ",
                pathname === route.href ? "text-blue-500" : ""
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          );
        })}
      </div>
    </>
  );
};
export default AdminSidebar;
