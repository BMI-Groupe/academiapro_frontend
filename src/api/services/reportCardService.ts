import axiosInstance from "../axios";

const reportCardService = {
    // Get single report card details
    get: async (id: number) => {
        const res = await axiosInstance.get(`/report-cards/${id}`);
        return res.data;
    },

    // Get all report cards for a student, optionally filtered by year
    list: async (studentId: number, schoolYearId?: number) => {
        const res = await axiosInstance.get(`/students/${studentId}/report-cards`, {
            params: { school_year_id: schoolYearId }
        });
        return res.data;
    },

    // Download PDF (not yet implemented backend side completely, but route exists)
    download: async (id: number) => {
        return axiosInstance.get(`/report-cards/${id}/download`, { responseType: 'blob' });
    },

    update: async (id: number, data: any) => {
        const res = await axiosInstance.put(`/report-cards/${id}`, data);
        return res.data;
    },

    generate: async (studentId: number, schoolYearId: number) => {
        const res = await axiosInstance.post(`/report-cards/generate`, { student_id: studentId, school_year_id: schoolYearId });
        return res.data;
    }
};

export default reportCardService;
