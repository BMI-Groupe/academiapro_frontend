import axiosInstance from "../axios";

const list = async (params = {}) => {
    const res = await axiosInstance.get(`/enrollments`, { params });
    return res.data;
};

const get = async (id: number) => {
    const res = await axiosInstance.get(`/enrollments/${id}`);
    return res.data;
};

const create = async (payload: any) => {
    const res = await axiosInstance.post(`/enrollments`, payload);
    return res.data;
};

const update = async (id: number, payload: any) => {
    const res = await axiosInstance.put(`/enrollments/${id}`, payload);
    return res.data;
};

const remove = async (id: number) => {
    const res = await axiosInstance.delete(`/enrollments/${id}`);
    return res.data;
};

const getByStudent = async (studentId: number, params = {}) => {
    const res = await axiosInstance.get(`/students/${studentId}/enrollments`, { params });
    return res.data;
};

const getByClassroom = async (classroomId: number, params = {}) => {
    const res = await axiosInstance.get(`/classrooms/${classroomId}/enrollments`, { params });
    return res.data;
};

const getCurrentEnrollment = async (studentId: number) => {
    const res = await axiosInstance.get(`/students/${studentId}/current-enrollment`);
    return res.data;
};

export default {
    list,
    get,
    create,
    update,
    remove,
    getByStudent,
    getByClassroom,
    getCurrentEnrollment,
};
