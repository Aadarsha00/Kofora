import api from "@/axios/api.axios";
import { User } from "@/interface/auth";
import { Address, AddressInput, AddressResponse } from "@/interface/checkout";
import { ApiEnvelope } from "@/interface/cart";

type UserResponse = ApiEnvelope<User>;

export type ProfileUpdatePayload = Partial<
  Pick<User, "first_name" | "last_name" | "username" | "phone" | "marketing_opt_in">
>;

export const getProfile = async (): Promise<User> => {
  const response = await api.get<UserResponse>("/users/me/");
  return response.data.data;
};

export const updateProfile = async (payload: ProfileUpdatePayload): Promise<User> => {
  const response = await api.patch<UserResponse>("/users/me/", payload);
  return response.data.data;
};

export const changePassword = async (payload: {
  current_password: string;
  new_password: string;
}): Promise<void> => {
  await api.post("/users/me/password/", payload);
};

export const updateAddress = async (id: number, payload: Partial<AddressInput>): Promise<Address> => {
  const response = await api.patch<AddressResponse>(`/addresses/${id}/`, payload);
  return response.data.data;
};

export const deleteAddress = async (id: number): Promise<void> => {
  await api.delete(`/addresses/${id}/`);
};
