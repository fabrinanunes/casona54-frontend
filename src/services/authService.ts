import { apiRequest } from "./api";

export type User = {
  id: number;
  email: string;
};

type LoginData = {
  email: string;
  password: string;
};

export async function login(data: LoginData): Promise<void> {
  await apiRequest<void>("/login", {
    method: "POST",
    body: data,
  });
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/me");
}