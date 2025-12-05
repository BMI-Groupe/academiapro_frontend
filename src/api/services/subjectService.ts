import axiosInstance from "../axios";

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/subjects`, { params });
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/subjects/${id}`);
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/subjects`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/subjects/${id}`, payload);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/subjects/${id}`);
  return res.data;
};

const getClassrooms = async (subjectId: number) => {
  const res = await axiosInstance.get(`/subjects/${subjectId}/classrooms`);
  return res.data;
};

export default {
  list,
  get,
  create,
  update,
  remove,
  getClassrooms,
};
