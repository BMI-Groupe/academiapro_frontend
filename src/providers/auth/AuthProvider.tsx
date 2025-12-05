import { useEffect, useState } from "react";
import axios from "../../api/axios.ts";
import AuthContext from "../../context/AuthContext.tsx";
import axiosInstance from "../../api/axios.ts";
import {Link, useNavigate} from "react-router";

export default function AuthProvider({ children }) {
    let [accessToken, setAccessToken] = useState(null);
    let [refreshToken, setRefreshToken] = useState(null);
    let [userInfo, setUserInfo] = useState(null);
    let [userData, setUserData] = useState(null);
    let [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const initAuth = () => {
            const storedUser = localStorage.getItem("userInfo");
            const storedUserData = localStorage.getItem("userData");
            const storedAccessToken = localStorage.getItem("accessToken");
            const storedRefreshToken = localStorage.getItem("refreshToken");

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUserInfo(parsedUser);
                    // @ts-ignore
                    const parsedUserData = JSON.parse(storedUserData);
                    setUserData(parsedUserData);
                    // @ts-ignore
                    setAccessToken(storedAccessToken);
                    // @ts-ignore
                    setRefreshToken(storedRefreshToken);
                } catch (e) {
                    console.error("Impossible de parser userInfo");
                    localStorage.removeItem("userInfo");
                    localStorage.removeItem("userData");
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (phone, password, navigate) => {
        try {
            const res = await axiosInstance.post("/login", { phone, password });
            console.log("LOGIN DATA: ");
            console.log(res.data);

            if (res.data.success === true) {
                // data is an array with one element containing user and tokens
                const loginData = res.data.data[0];
                const u = loginData.user;
                const tokens = loginData.tokens;

                setUserInfo(u);
                setRefreshToken(tokens.refreshToken);
                setAccessToken(tokens.accessToken);

                localStorage.setItem("accessToken", tokens.accessToken);
                localStorage.setItem("refreshToken", tokens.refreshToken);
                localStorage.setItem("userInfo", JSON.stringify(u));

                console.log("Connexion réussie !");
            } else {
                console.log("Connexion échouée !");
            }

            return res.data;
        } catch (err) {
            // @ts-ignore
            console.error("Login error", err.response?.data || err.message);
            
            // Extract error details from backend response
            // @ts-ignore
            if (err.response) {
                // Server responded with an error status
                return {
                    success: false,
                    // @ts-ignore
                    message: err.response.data?.message || "Une erreur est survenue lors de la connexion.",
                    // @ts-ignore
                    status: err.response.status
                };
                // @ts-ignore
            } else if (err.request) {
                // Request was made but no response received (network error)
                return {
                    success: false,
                    message: "Impossible de contacter le serveur. Veuillez vérifier votre connexion.",
                    status: 0
                };
            } else {
                // Something else happened
                return {
                    success: false,
                    // @ts-ignore
                    message: err.message || "Une erreur inattendue est survenue.",
                    status: -1
                };
            }
        }
    };

    const authMe = async (id: any) => {
        try {
            console.log("Access Token", accessToken);
            const user = await axiosInstance.get(`/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            const u = user.data.data[0];
            setUserData(u);
            localStorage.setItem("userData", JSON.stringify(u));

            console.log("Connecté !");
        } catch (error) {
            // @ts-ignore
            console.error("Error", error.response?.data || error.message);
            // @ts-ignore
            if (error.response?.status === 401) {
                navigate("/signin");
            }
        }
    };

    const getUserInfos = async (id: any) => {
        try {
            const user = await  axiosInstance.get(`/users/${id}`);
            const userInfo = user.data.data;
            setUserInfo(userInfo);
            localStorage.setItem("userInfo", JSON.stringify(userInfo));

            console.log("Récupérée !");
        } catch (err) {
            // @ts-ignore
            console.error("Error", err.response?.data || err.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        setUserInfo(null);
    };

    const refresh = async () => {
        try {
            // Vous pouvez implémenter un vrai refresh token endpoint plus tard
            logout();
        } catch (err) {
            logout();
        }
    };

    return (
        // @ts-ignore
        <AuthContext.Provider value={{ userInfo, userData, accessToken, refreshToken, login, logout, authMe, getUserInfos, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}
