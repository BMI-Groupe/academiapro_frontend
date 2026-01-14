import axios from "axios";

const baseURL = "https://api-prod.academiapro.net/api/v1.0.0";
// const baseURL = "http://api-prod.academiapro.hstgr.cloud/api/v1.0.0";
// const baseURL = "http://127.0.0.1:8000/api/v1.0.0";
export const STORAGE_URL = "https://api-prod.academiapro.net/storage";
// export const STORAGE_URL = "http://127.0.0.1:8000/storage";
// API Doc URL http://api-prod.academiapro.net/docs

const axiosInstance = axios.create({
    baseURL,
    timeout: 30000, // 30 secondes
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
