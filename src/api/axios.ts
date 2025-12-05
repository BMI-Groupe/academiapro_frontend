import axios from "axios";

const baseURL = "http://api-prod.academiapro.net";
// const baseURL = "http://api-prod.academiapro.hstgr.cloud/";
// const baseURL = "http://127.0.0.1:8000/api/v1.0.0";
// API Doc URL http://api-prod.academiapro.net/request-docs
const url = baseURL + "/v1.0.0"

const axiosInstance = axios.create({
    url,
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
