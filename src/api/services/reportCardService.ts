import axiosInstance from "../axios";

const list = async (params = {}) => {
    const res = await axiosInstance.get(`/report-cards`, { params });
    return res.data;
};

const get = async (id: number) => {
    const res = await axiosInstance.get(`/report-cards/${id}`);
    return res.data;
};

const getByStudent = async (studentId: number, params = {}) => {
    const res = await axiosInstance.get(`/students/${studentId}/report-cards`, { params });
    return res.data;
};

const getByClassroom = async (classroomId: number, params = {}) => {
    const res = await axiosInstance.get(`/classrooms/${classroomId}/report-cards`, { params });
    return res.data;
};

const generate = async (studentId: number, schoolYearId: number) => {
    const res = await axiosInstance.post(`/report-cards/generate`, {
        student_id: studentId,
        school_year_id: schoolYearId,
    });
    return res.data;
};

const download = async (id: number) => {
    const res = await axiosInstance.get(`/report-cards/${id}/download`, {
        responseType: 'blob',
    });
    return res.data;
};

export default {
    list,
    get,
    getByStudent,
    getByClassroom,
    generate,
    download,
};
