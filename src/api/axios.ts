import axios from "axios";

const baseURL = "http://api-prod.academiapro.net/api/v1.0.0";
// const baseURL = "http://api-prod.academiapro.hstgr.cloud/api/v1.0.0";
// const baseURL = "http://127.0.0.1:8000/api/v1.0.0";
// API Doc URL http://api-prod.academiapro.net/request-docs

const axiosInstance = axios.create({
    baseURL,
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
