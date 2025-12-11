import axiosInstance from "../../api/axios";

export interface Payment {
    id: number;
    student_id: number;
    user_id: number | null;
    amount: number;
    payment_date: string;
    type: string;
    reference: string;
    notes: string | null;
    created_at: string;
    student?: {
        id: number;
        first_name: string;
        last_name: string;
        matricule: string;
        classroom?: {
            id: number;
            name: string;
        };
    };
    user?: {
        id: number;
        name: string;
    };
}

export interface Balance {
    total_due: number;
    total_paid: number;
    balance: number;
    currency: string;
    classroom: string;
}

const paymentService = {
    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get("/payments", { params });
            // The API returns paginated data in response.data.data
            // response.data = { success: true, data: { current_page: 1, data: [...], ... }, message: "..." }
            // OR if utilizing standard Resources: 
            // We need to check what PaymentController::index returns.
            // Assuming ApiResponse::sendResponse(true, $payments, ...) where $payments is paginated object
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la récupération des paiements.",
            };
        }
    },

    getStudentBalance: async (studentId: number, schoolYearId?: number) => {
        try {
            const response = await axiosInstance.get(`/students/${studentId}/balance`, {
                params: { school_year_id: schoolYearId },
            });
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la récupération du bilan financier.",
            };
        }
    },

    getStudentPayments: async (studentId: number, schoolYearId?: number) => {
        try {
            const response = await axiosInstance.get(`/students/${studentId}/payments`, {
                params: { school_year_id: schoolYearId },
            });
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la récupération des paiements.",
            };
        }
    },

    getStudentPaymentDetails: async (studentId: number, schoolYearId?: number) => {
        try {
            const response = await axiosInstance.get(`/students/${studentId}/payment-details`, {
                params: { school_year_id: schoolYearId },
            });
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la récupération des détails de paiement.",
            };
        }
    },

    recordPayment: async (data: {
        student_id: number;
        amount: number;
        payment_date: string;
        type: string;
        school_year_id?: number;
        notes?: string;
    }) => {
        try {
            const response = await axiosInstance.post("/payments", data);
            return { success: true, data: response.data.data[0] };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de l'enregistrement du paiement.",
            };
        }
    },

    get: async (id: number) => {
        try {
            const response = await axiosInstance.get(`/payments/${id}`);
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors de la récupération du paiement.",
            };
        }
    },

    downloadReceipt: async (paymentId: number) => {
        try {
            const response = await axiosInstance.get(`/payments/${paymentId}/receipt`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `recu_${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Erreur lors du téléchargement du reçu.",
            };
        }
    },
};

export default paymentService;
