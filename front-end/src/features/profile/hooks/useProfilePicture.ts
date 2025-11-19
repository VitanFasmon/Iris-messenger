import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfilePicture, deleteProfilePicture } from "../api/profile";
import type { User } from "../../../types/api";

export function useProfilePicture() {
  const qc = useQueryClient();

  const upload = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: (_user: User) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteProfilePicture,
    onSuccess: (_user: User) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  return { upload, remove };
}
