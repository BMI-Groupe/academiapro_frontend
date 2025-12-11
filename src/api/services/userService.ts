import axios from "../axios";

const endpoint = "/users";

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    school_id?: number;
    created_at: string;
    school?: {
        id: number;
        name: string;
    };
}

const userService = {
    list: async (params: any = {}) => {
        try {
            const response = await axios.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    create: async (payload: any) => {
        try {
            const response = await axios.post(endpoint, payload);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    delete: async (id: number) => {
        try {
            const response = await axios.delete(`${endpoint}/${id}`);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
};

export default userService;
