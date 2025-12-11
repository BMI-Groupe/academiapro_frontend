import axiosInstance from "../axios";

const login = async (phone: string, password: string) => {
  const res = await axiosInstance.post("/login", { phone, password });
  return res.data;
};

const me = async () => {
  const res = await axiosInstance.get("/me");
  return res.data;
};

const logout = async () => {
  const res = await axiosInstance.post("/logout");
  return res.data;
};

const forgotPassword = async (email: string) => {
  const res = await axiosInstance.post("/forgot-password", { email });
  return res.data;
};

const resetPassword = async (payload: any) => {
  const res = await axiosInstance.post("/reset-password", payload);
  return res.data;
};

export default {
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
};
