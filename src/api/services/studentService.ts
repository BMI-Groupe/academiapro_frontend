import axiosInstance from "../axios";

const getProfile = async (id: number) => {
  const res = await axiosInstance.get(`/students/${id}/profile`);
  return res.data;
};

const getGrades = async (id: number, schoolYearId: number) => {
  const res = await axiosInstance.get(`/students/${id}/grades`, {
    params: { school_year_id: schoolYearId }
  });
  return res.data;
};

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/students`, { params });
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/students/${id}`);
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/students`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/students/${id}`, payload);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/students/${id}`);
  return res.data;
};

export default {
  list,
  get,
  getProfile,
  getGrades,
  create,
  update,
  remove,
};
