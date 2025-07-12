import { MFASettings } from "@/components/app/settings/mfa";
import { ProfileSettings } from "@/components/app/settings/profile";

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <ProfileSettings />
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Security</h2>
        <MFASettings />
      </section>
    </div>
  );
};

export default SettingsPage; 