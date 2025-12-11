import axiosInstance from "../axios";

const studentDetailService = {
    // Détails complets de l'élève
    getDetails: (studentId: number) => {
        return axiosInstance.get(`/students/${studentId}/details`);
    },

    // Historique des inscriptions
    getEnrollments: (studentId: number) => {
        return axiosInstance.get(`/students/${studentId}/enrollments`);
    },

    // Notes par année scolaire
    getGrades: (studentId: number, schoolYearId?: number) => {
        return axiosInstance.get(`/students/${studentId}/grades`, {
            params: { school_year_id: schoolYearId }
        });
    },

    // Examens de l'élève
    getAssignments: (studentId: number, schoolYearId?: number) => {
        return axiosInstance.get(`/students/${studentId}/assignments`, {
            params: { school_year_id: schoolYearId }
        });
    }
};

export default studentDetailService;
