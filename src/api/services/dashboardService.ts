import axiosInstance from "../axios";

const dashboardService = {
    getStats: (school_year_id?: number) => {
        const params = school_year_id ? { school_year_id } : {};
        return axiosInstance.get('/dashboard/stats', { params });
    }
};

export default dashboardService;
