import axios from '../axios';

const classroomSubjectService = {
    /**
     * Obtenir le programme d'une classe pour une année
     */
    getProgram: (classroomId: number, schoolYearId?: number) => {
        const params = schoolYearId ? { school_year_id: schoolYearId } : {};
        return axios.get(`/classrooms/${classroomId}/subjects`, { params }).then((res) => res.data);
    },

    /**
     * Assigner une matière à une classe
     */
    assignSubject: (classroomId: number, data: {
        subject_id: number;
        coefficient: number;
        school_year_id?: number;
    }) => {
        return axios.post(`/classrooms/${classroomId}/subjects`, data).then((res) => res.data);
    },

    /**
     * Mettre à jour le coefficient d'une matière
     */
    updateCoefficient: (classroomId: number, subjectId: number, data: {
        coefficient: number;
        school_year_id?: number;
    }) => {
        return axios.put(`/classrooms/${classroomId}/subjects/${subjectId}`, data).then((res) => res.data);
    },

    /**
     * Retirer une matière d'une classe
     */
    removeSubject: (classroomId: number, subjectId: number, schoolYearId?: number) => {
        const params = schoolYearId ? { school_year_id: schoolYearId } : {};
        return axios.delete(`/classrooms/${classroomId}/subjects/${subjectId}`, { params }).then((res) => res.data);
    },

    /**
     * Copier le programme d'une année à une autre
     */
    copyProgram: (classroomId: number, data: {
        from_year_id: number;
        to_year_id: number;
    }) => {
        return axios.post(`/classrooms/${classroomId}/subjects/copy`, data).then((res) => res.data);
    },
};

export default classroomSubjectService;
