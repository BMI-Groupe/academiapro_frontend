import axiosInstance from "../axios";

const dashboardService = {
    getStats: async (school_year_id?: number) => {
        const params = school_year_id ? { school_year_id } : {};
        const res = await axiosInstance.get('/dashboard/stats', { params });
        return res.data;
    }
};

export default dashboardService;
