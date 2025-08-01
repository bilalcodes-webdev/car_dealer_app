"use client";
import {
  getDealershipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFetch from "@/hooks/use-fetch-hook";
import { Clock, Loader2, Search, Shield, User, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );

  const [userSearch, setUserSearch] = useState("");

  const handleWorkingHourChange = (index, field, value) => {
    const updated = [...workingHours];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setWorkingHours(updated);
  };

  const {
    isLoading: getDealerLoading,
    fn: getDealerFn,
    data: getDealerData,
  } = useFetch(getDealershipInfo);

  const {
    isLoading: workingHourLoading,
    error: workingHourError,
    fn: workingHourFn,
    data: workingHourData,
  } = useFetch(saveWorkingHours);

  const {
    isLoading: getUserLoading,
    fn: getUserFn,
    data: getUserData,
  } = useFetch(getUsers);

  const {
    isLoading: updateUserRoleLoading,
    error: updateUserRoleError,
    fn: updateUserRoleFn,
    data: updateUserRoleData,
  } = useFetch(updateUserRole);

  useEffect(() => {
    getDealerFn();
    getUserFn();
  }, []);

  const handleRemoveAdmin = async (user) => {
    if (confirm(`Are you sure you want to remove ${user.name} (${user.email}) from Admin Access?`)) {
      await updateUserRoleFn(user.id, "USER");
    }
  };

  const handleMakeAdmin = async (user) => {
    if (confirm(`Are you sure to give ${user.name} (${user.email}) admin access?`)) {
      await updateUserRoleFn(user.id, "ADMIN");
    }
  };

  useEffect(() => {
    if (updateUserRoleData?.success && !updateUserRoleLoading) {
      toast.success("Role Updated Successfully");
      getUserFn();
    }
    if (updateUserRoleError) {
      toast.error("Failed To Update User Role");
    }
  }, [updateUserRoleData, updateUserRoleError, updateUserRoleLoading]);

  useEffect(() => {
    if (getDealerData?.success) {
      const dealership = getDealerData.data;
      if (dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          const hoursData = dealership.workingHours.find((h) => h.dayOfWeek === day.value);
          return hoursData
            ? { ...hoursData }
            : {
                dayOfWeek: day.value,
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: day.value !== "SUNDAY",
              };
        });
        setWorkingHours(mappedHours);
      }
    }
  }, [getDealerData]);

  const handleHoursUpdate = async () => {
    await workingHourFn(workingHours);
  };

  useEffect(() => {
    if (workingHourData?.success && !workingHourLoading) {
      toast.success("Working Hours Updated");
      getDealerFn();
    }
    if (workingHourError) {
      toast.error("Unable To Update Working Hours");
    }
  }, [workingHourData, workingHourLoading, workingHourError]);

  const filteredUsers = getUserData?.success
    ? getUserData.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours" className="w-full">
        <TabsList>
          <TabsTrigger value="hours">
            <Clock className="w-4 h-4 mr-2" /> Working Hours
          </TabsTrigger>
          <TabsTrigger value="admin">
            <Shield className="w-4 h-4 mr-2" /> Admin User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>Set your dealership's working hours.</CardDescription>
            </CardHeader>
            <CardContent>
              {DAYS.map((day, index) => {
                const isOpen = workingHours[index].isOpen;
                return (
                  <div key={day.value} className="grid grid-cols-12 gap-4 items-center py-3">
                    <div className="col-span-2 font-medium">{day.label}</div>
                    <div className="col-span-2 flex items-center">
                      <Checkbox
                        id={`is-open-${day.value}`}
                        checked={isOpen}
                        onCheckedChange={(checked) =>
                          handleWorkingHourChange(index, "isOpen", checked)
                        }
                      />
                      <label htmlFor={`is-open-${day.value}`} className="ml-2">
                        {isOpen ? "Open" : "Closed"}
                      </label>
                    </div>
                    {isOpen && (
                      <div className="col-span-8 flex items-center gap-4">
                        <Input
                          type="time"
                          value={workingHours[index].openTime}
                          onChange={(e) =>
                            handleWorkingHourChange(index, "openTime", e.target.value)
                          }
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={workingHours[index].closeTime}
                          onChange={(e) =>
                            handleWorkingHourChange(index, "closeTime", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="mt-4 text-right">
                <Button onClick={handleHoursUpdate} disabled={workingHourLoading}>
                  {workingHourLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Update Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Manage Admin Users</CardTitle>
              <CardDescription>Assign or remove admin rights.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              {getUserLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={user.name || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span>{user.name || "Unnamed User"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              user.role === "ADMIN"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role === "ADMIN" ? "Admin" : "User"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role === "ADMIN" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAdmin(user)}
                              disabled={updateUserRoleLoading}
                            >
                              <UserX className="w-4 h-4 mr-2" /> Remove Admin
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeAdmin(user)}
                              disabled={updateUserRoleLoading}
                            >
                              <Shield className="w-4 h-4 mr-2" /> Make Admin
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
