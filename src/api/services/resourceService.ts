import axiosInstance from "../axios";

export interface PedagogicalResource {
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    file_name: string;
    file_type: string | null;
    type: 'course' | 'assignment' | 'exam' | 'other';
    subject_id: number | null;
    section_id: number | null;
    teacher_id: number | null;
    school_year_id: number;
    school_id: number;
    created_at: string;
    updated_at: string;
    teacher?: {
        id: number;
        user: {
            name: string;
        };
    };
    section?: {
        id: number;
        name: string;
        code: string;
    };
    subject?: {
        id: number;
        name: string;
    };
}

export interface ResourceFilters {
    school_year_id?: number;
    section_id?: number;
    subject_id?: number;
    type?: string;
}

const resourceService = {
    getAll: async (filters?: ResourceFilters) => {
        const response = await axiosInstance.get('/pedagogical-resources', { params: filters });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axiosInstance.get(`/pedagogical-resources/${id}`);
        return response.data;
    },

    upload: async (formData: FormData) => {
        const response = await axiosInstance.post('/pedagogical-resources', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/pedagogical-resources/${id}`);
        return response.data;
    },

    download: async (id: number, fileName: string) => {
        const response = await axiosInstance.get(`/pedagogical-resources/${id}/download`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

export default resourceService;
