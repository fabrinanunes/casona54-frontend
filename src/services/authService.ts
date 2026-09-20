import { apiUrl } from "./api";

export type User = {
  id: number;
  email: string;
};

type LoginData = {
  email: string;
  password: string;
};

export async function login(data: LoginData): Promise<void> {
  const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Credentials are incorrect.");
  }
}

export async function logout(): Promise<void> {
  const response = await fetch(`${apiUrl}/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error doing logout.");
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${apiUrl}/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("User not authenticated.");
  }

  return response.json();
}