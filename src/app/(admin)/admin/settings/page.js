import SettingsForm from "./_components/SettingsForm";

export const methadeta = {
  title: "Settings | Admin",
  description: "Manage dealership and working hours and manage admin users",
};

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <SettingsForm />
    </div>
  );
};
export default SettingsPage;
