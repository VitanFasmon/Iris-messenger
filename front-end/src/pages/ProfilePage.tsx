import React from "react";
import { ProfileSettings } from "../features/profile/components/ProfileSettings";

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile information and picture
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
