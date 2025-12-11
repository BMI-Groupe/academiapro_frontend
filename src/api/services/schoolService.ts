import axios from '../axios';

// Interfaces
export interface School {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SchoolListResponse {
    success: boolean;
    data: School[];
    message: string;
}

export interface SchoolDetailResponse {
    success: boolean;
    data: School[]; // API often returns array even for single item based on Controller
    message: string;
}

export interface SchoolCreateResponse {
    success: boolean;
    data: Array<{
        school: School;
        director: {
            id: number;
            name: string;
            email: string;
            phone: string;
            password: string; // Mot de passe en clair pour l'envoi d'email
        };
    }>;
    message: string;
}

const schoolService = {
    // Get all schools
    list: async (): Promise<SchoolListResponse> => {
        const response = await axios.get('/schools');
        return response.data;
    },

    // Get a single school
    get: async (id: number): Promise<SchoolDetailResponse> => {
        const response = await axios.get(`/schools/${id}`);
        return response.data;
    },

    // Create a new school
    create: async (data: FormData): Promise<SchoolCreateResponse> => {
        const response = await axios.post('/schools', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Update a school
    update: async (id: number, data: FormData): Promise<SchoolDetailResponse> => {
        // For PUT/PATCH with files, sometimes Laravel needs POST with _method=PUT
        // Appending _method is safer if using FormData
        data.append('_method', 'PUT');
        const response = await axios.post(`/schools/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Delete a school
    delete: async (id: number): Promise<any> => {
        const response = await axios.delete(`/schools/${id}`);
        return response.data;
    },
};

export default schoolService;
