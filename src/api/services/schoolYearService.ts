import axiosInstance from "../axios";

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/school-years`, { params });
  return res.data;
};

const getActive = async () => {
  const res = await axiosInstance.get(`/school-years/active`);
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/school-years/${id}`);
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/school-years`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/school-years/${id}`, payload);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/school-years/${id}`);
  return res.data;
};

export default {
  list,
  getActive,
  get,
  create,
  update,
  remove,
};
