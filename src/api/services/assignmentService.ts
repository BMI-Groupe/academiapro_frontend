import axiosInstance from "../axios";

const ENDPOINT = "/assignments";

export interface Assignment {
    id: number;
    title: string;
    description?: string;
    evaluation_type_id: number;
    max_score: number;
    due_date: string;
    classroom_id: number;
    subject_id: number;
    school_year_id: number;
    created_by: number;
    created_at?: string;
    updated_at?: string;
    classroom?: any;
    subject?: any;
    evaluation_type?: any;
    grades?: any[];
}

const assignmentService = {
    list: async (params?: any) => {
        const res = await axiosInstance.get(ENDPOINT, { params });
        return res.data;
    },

    get: async (id: number) => {
        const res = await axiosInstance.get(`${ENDPOINT}/${id}`);
        return res.data;
    },

    create: async (data: Partial<Assignment>) => {
        const res = await axiosInstance.post(ENDPOINT, data);
        return res.data;
    },

    update: async (id: number, data: Partial<Assignment>) => {
        const res = await axiosInstance.put(`${ENDPOINT}/${id}`, data);
        return res.data;
    },

    remove: async (id: number) => {
        const res = await axiosInstance.delete(`${ENDPOINT}/${id}`);
        return res.data;
    },
};

export default assignmentService;
