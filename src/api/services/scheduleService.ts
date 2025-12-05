import axiosInstance from "../axios";

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/schedules`, { params });
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/schedules`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/schedules/${id}`, payload);
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/schedules/${id}`);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/schedules/${id}`);
  return res.data;
};

export default {
  list,
  get,
  create,
  update,
  remove,
};
