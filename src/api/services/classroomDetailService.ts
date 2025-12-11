import axiosInstance from "../axios";

const classroomDetailService = {
    // Détails de la classe avec élèves
    getDetails: (classroomId: number, schoolYearId?: number) => {
        return axiosInstance.get(`/classrooms/${classroomId}/details`, {
            params: { school_year_id: schoolYearId }
        });
    },

    // Classement des élèves
    getRanking: (classroomId: number, params?: { assignment_id?: number; school_year_id?: number }) => {
        return axiosInstance.get(`/classrooms/${classroomId}/ranking`, { params });
    },

    // Liste des examens de la classe
    getAssignments: (classroomId: number, schoolYearId?: number) => {
        return axiosInstance.get(`/classrooms/${classroomId}/assignments`, {
            params: { school_year_id: schoolYearId }
        });
    }
};

export default classroomDetailService;
