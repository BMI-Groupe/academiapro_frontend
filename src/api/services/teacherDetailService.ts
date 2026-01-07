import axiosInstance from "../axios";

const getDetails = async (id: number) => {
  const res = await axiosInstance.get(`/teachers/${id}/details`);
  return res;
};

const getAssignments = async (id: number) => {
  const res = await axiosInstance.get(`/teachers/${id}/assignments`);
  return res;
};

const assignSectionSubject = async (
  teacherId: number,
  sectionId: number,
  subjectId: number,
  schoolYearId: number
) => {
  const res = await axiosInstance.post(`/teachers/${teacherId}/assign-section-subject`, {
    section_id: sectionId,
    subject_id: subjectId,
    school_year_id: schoolYearId,
  });
  return res;
};

const reassignSectionSubject = async (
  teacherId: number,
  currentAssignmentId: number,
  sectionId: number,
  subjectId: number,
  schoolYearId: number
) => {
  const res = await axiosInstance.post(`/teachers/${teacherId}/reassign-section-subject`, {
    current_assignment_id: currentAssignmentId,
    section_id: sectionId,
    subject_id: subjectId,
    school_year_id: schoolYearId,
  });
  return res;
};

const removeAssignment = async (teacherId: number, assignmentId: number) => {
  const res = await axiosInstance.delete(`/teachers/${teacherId}/assignments/${assignmentId}`);
  return res;
};

export default {
  getDetails,
  getAssignments,
  assignSectionSubject,
  reassignSectionSubject,
  removeAssignment,
};

