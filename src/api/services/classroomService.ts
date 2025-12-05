import axiosInstance from "../axios";

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/classrooms`, { params });
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/classrooms/${id}`);
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/classrooms`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/classrooms/${id}`, payload);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/classrooms/${id}`);
  return res.data;
};

const getSubjects = async (classroomId: number) => {
  const res = await axiosInstance.get(`/classrooms/${classroomId}/subjects`);
  return res.data;
};

const assignSubject = async (classroomId: number, subjectId: number, coefficient: number) => {
  const res = await axiosInstance.post(`/classrooms/${classroomId}/subjects`, {
    subject_id: subjectId,
    coefficient,
  });
  return res.data;
};

const updateSubjectCoefficient = async (classroomId: number, subjectId: number, coefficient: number) => {
  const res = await axiosInstance.put(`/classrooms/${classroomId}/subjects/${subjectId}`, {
    coefficient,
  });
  return res.data;
};

const removeSubject = async (classroomId: number, subjectId: number) => {
  const res = await axiosInstance.delete(`/classrooms/${classroomId}/subjects/${subjectId}`);
  return res.data;
};

const getTeachers = async (classroomId: number, params = {}) => {
  const res = await axiosInstance.get(`/classrooms/${classroomId}/teachers`, { params });
  return res.data;
};

const getRanking = async (classroomId: number, schoolYearId: number, assignmentId?: number) => {
  const params: any = { school_year_id: schoolYearId };
  if (assignmentId) params.assignment_id = assignmentId;
  const res = await axiosInstance.get(`/classrooms/${classroomId}/ranking`, { params });
  return res.data;
};

export default {
  list,
  get,
  create,
  update,
  remove,
  getSubjects,
  assignSubject,
  updateSubjectCoefficient,
  removeSubject,
  getTeachers,
  getRanking,
};
