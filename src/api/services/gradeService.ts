import axiosInstance from "../axios";

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/grades`, { params });
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/grades`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/grades/${id}`, payload);
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/grades/${id}`);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/grades/${id}`);
  return res.data;
};

const getByStudent = async (studentId: number, params = {}) => {
  const res = await axiosInstance.get(`/students/${studentId}/grades`, { params });
  return res.data;
};

const getByAssignment = async (assignmentId: number) => {
  const res = await axiosInstance.get(`/assignments/${assignmentId}/grades`);
  return res.data;
};

const getByClassroom = async (classroomId: number, params = {}) => {
  const res = await axiosInstance.get(`/classrooms/${classroomId}/grades`, { params });
  return res.data;
};

const bulkCreate = async (assignmentId: number, grades: Array<{ student_id: number; score: number; notes?: string }>) => {
  const res = await axiosInstance.post(`/assignments/${assignmentId}/grades/bulk`, { grades });
  return res.data;
};

export default {
  list,
  get,
  create,
  update,
  remove,
  getByStudent,
  getByAssignment,
  getByClassroom,
  bulkCreate,
};
