import React, { useRef } from "react";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { useSession } from "../../auth/hooks/useSession";
import { Button } from "../../../ui/Button";
import { Avatar } from "../../../ui/Avatar";
import { Skeleton } from "../../../ui/Skeleton";
import { useUiStore } from "../../../store/uiStore";

export const ProfileSettings: React.FC = () => {
  const { data: user, status } = useSession();
  const { upload, remove } = useProfilePicture();
  const fileRef = useRef<HTMLInputElement>(null);
  const { pushToast } = useUiStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Client-side validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!file.type.startsWith("image/")) {
        pushToast({
          type: "error",
          message: "Please select a valid image file.",
        });
        return;
      }
      if (file.size > maxSize) {
        pushToast({
          type: "error",
          message: "Image too large. Max size is 5MB.",
        });
        return;
      }
      const formData = new FormData();
      // Backend expects the field name 'profile_picture'
      formData.append("profile_picture", file);
      upload.mutate(formData, {
        onSuccess: () =>
          pushToast({ type: "success", message: "Profile picture updated." }),
        onError: (err: any) => {
          const serverMsg = err?.response?.data?.message;
          const firstFieldError = (() => {
            const errors = err?.response?.data?.errors;
            if (errors && typeof errors === "object") {
              const first = Object.values(errors)[0] as string[] | undefined;
              return first?.[0];
            }
            return undefined;
          })();
          pushToast({
            type: "error",
            message:
              serverMsg || firstFieldError || err?.message || "Upload failed.",
          });
        },
      });
    }
  };

  const handleDelete = () => {
    remove.mutate(undefined, {
      onSuccess: () =>
        pushToast({ type: "success", message: "Profile picture removed." }),
      onError: (err: any) =>
        pushToast({ type: "error", message: err?.message || "Delete failed." }),
    });
  };

  // Cache busting: append timestamp to avatar URL
  const avatarUrl = user?.profile_picture_url
    ? `${user.profile_picture_url}?t=${Date.now()}`
    : undefined;

  if (status === "pending") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-48 h-6" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-36 h-9" />
          <Skeleton className="w-36 h-9" />
        </div>
      </div>
    );
  }

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
          aria-label="Upload profile picture file"
        />
        <Button
          onClick={() => fileRef.current?.click()}
          loading={upload.status === "pending"}
          aria-label="Choose profile picture to upload"
        >
          Upload New Picture
        </Button>
        <Button
          onClick={handleDelete}
          variant="ghost"
          loading={remove.status === "pending"}
          aria-label="Delete current profile picture"
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
