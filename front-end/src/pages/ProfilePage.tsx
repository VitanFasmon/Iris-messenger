import React from "react";
import { ProfileSettings } from "../features/profile/components/ProfileSettings";

const ProfilePage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Profile</h1>
      <ProfileSettings />
    </div>
  );
};

export default ProfilePage;
