import api from "./api";
import { CRMUser } from "../types";

export const getMe = async (): Promise<CRMUser | null> => {
  try {
    const res = await api.get("/auth/me");
    return res.data.data.user;
  } catch {
    return null;
  }
};

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const logout = async () => {
  await api.post("/auth/logout");
};