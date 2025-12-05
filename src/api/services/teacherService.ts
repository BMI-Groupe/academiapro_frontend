import axiosInstance from "../axios";

const list = async (params = {}) => {
  const res = await axiosInstance.get(`/teachers`, { params });
  return res.data;
};

const get = async (id: number) => {
  const res = await axiosInstance.get(`/teachers/${id}`);
  return res.data;
};

const create = async (payload: any) => {
  const res = await axiosInstance.post(`/teachers`, payload);
  return res.data;
};

const update = async (id: number, payload: any) => {
  const res = await axiosInstance.put(`/teachers/${id}`, payload);
  return res.data;
};

const remove = async (id: number) => {
  const res = await axiosInstance.delete(`/teachers/${id}`);
  return res.data;
};

const getAssignments = async (teacherId: number, schoolYearId?: number) => {
  const params = schoolYearId ? { school_year_id: schoolYearId } : {};
  const res = await axiosInstance.get(`/teachers/${teacherId}/assignments`, { params });
  return res.data;
};

const assignToClassroomSubject = async (
  teacherId: number,
  classroomSubjectId: number,
  schoolYearId: number
) => {
  const res = await axiosInstance.post(`/teachers/${teacherId}/assign`, {
    classroom_subject_id: classroomSubjectId,
    school_year_id: schoolYearId,
  });
  return res.data;
};

const removeAssignment = async (teacherId: number, assignmentId: number) => {
  const res = await axiosInstance.delete(`/teachers/${teacherId}/assignments/${assignmentId}`);
  return res.data;
};

export default {
  list,
  get,
  create,
  update,
  remove,
  getAssignments,
  assignToClassroomSubject,
  removeAssignment,
};
