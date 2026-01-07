import axios from '../axios';

const classroomTemplateSubjectService = {
    /**
     * Obtenir les matières d'un template pour une année scolaire
     */
    getSubjects: (templateId: number, schoolYearId: number) => {
        return axios.get(`/classroom-templates/${templateId}/subjects`, {
            params: { school_year_id: schoolYearId }
        }).then((res) => res.data);
    },

    /**
     * Assigner une matière à un template pour une année scolaire
     */
    assignSubject: (templateId: number, data: {
        subject_id: number;
        coefficient: number;
        school_year_id: number;
    }) => {
        return axios.post(`/classroom-templates/${templateId}/subjects`, data).then((res) => res.data);
    },

    /**
     * Mettre à jour le coefficient d'une matière dans un template pour une année scolaire
     */
    updateCoefficient: (templateId: number, subjectId: number, data: {
        coefficient: number;
        school_year_id: number;
    }) => {
        return axios.put(`/classroom-templates/${templateId}/subjects/${subjectId}`, data).then((res) => res.data);
    },

    /**
     * Retirer une matière d'un template pour une année scolaire
     */
    removeSubject: (templateId: number, subjectId: number, schoolYearId: number) => {
        return axios.delete(`/classroom-templates/${templateId}/subjects/${subjectId}`, {
            params: { school_year_id: schoolYearId }
        }).then((res) => res.data);
    },
};

export default classroomTemplateSubjectService;

