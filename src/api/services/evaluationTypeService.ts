import axiosInstance from "../axios";

const ENDPOINT = "/evaluation-types";

export interface EvaluationType {
    id: number;
    name: string;
    weight: number;
    school_year_id: number;
    created_at?: string;
    updated_at?: string;
}

const evaluationTypeService = {
    list: async (params?: any) => {
        const res = await axiosInstance.get(ENDPOINT, { params });
        return res.data;
    },

    create: async (data: Partial<EvaluationType>) => {
        const res = await axiosInstance.post(ENDPOINT, data);
        return res.data;
    },

    update: async (id: number, data: Partial<EvaluationType>) => {
        const res = await axiosInstance.put(`${ENDPOINT}/${id}`, data);
        return res.data;
    },

    remove: async (id: number) => {
        const res = await axiosInstance.delete(`${ENDPOINT}/${id}`);
        return res.data;
    },
};

export default evaluationTypeService;
