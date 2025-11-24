export async function updateProfile(payload: {
  username?: string;
  email?: string;
}): Promise<User> {
  const { data } = await api.patch<User>("/profile", payload);
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/password",
    payload
  );
  return data;
}
import { api } from "../../../lib/axios";
import type { User } from "../../../types/api";

export async function uploadProfilePicture(formData: FormData): Promise<User> {
  const { data } = await api.post<User>("/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteProfilePicture(): Promise<User> {
  const { data } = await api.delete<User>("/profile/picture");
  return data;
}
