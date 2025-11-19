import React, { useRef } from "react";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { useSession } from "../../auth/hooks/useSession";
import { Button } from "../../../ui/Button";
import { Avatar } from "../../../ui/Avatar";

export const ProfileSettings: React.FC = () => {
  const { data: user } = useSession();
  const { upload, remove } = useProfilePicture();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("picture", e.target.files[0]);
      upload.mutate(formData);
    }
  };

  const handleDelete = () => {
    remove.mutate();
  };

  // Cache busting: append timestamp to avatar URL
  const avatarUrl = user?.profile_picture_url
    ? `${user.profile_picture_url}?t=${Date.now()}`
    : undefined;

  return (
    <div className="space-y-4">
      <Avatar
        src={avatarUrl}
        alt={user?.username || "Profile"}
        fallback={(user?.username?.[0] || "U").toUpperCase()}
      />
      <div>
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={handleUpload}
        />
        <Button
          onClick={() => fileRef.current?.click()}
          loading={upload.status === "pending"}
        >
          Upload New Picture
        </Button>
        <Button
          onClick={handleDelete}
          variant="ghost"
          loading={remove.status === "pending"}
        >
          Delete Picture
        </Button>
      </div>
      {(upload.status === "error" || remove.status === "error") && (
        <div className="text-red-500 text-sm">
          Error: {upload.error?.message || remove.error?.message}
        </div>
      )}
    </div>
  );
};
