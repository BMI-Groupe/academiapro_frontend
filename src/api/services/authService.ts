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

export default {
  login,
  me,
  logout,
};
