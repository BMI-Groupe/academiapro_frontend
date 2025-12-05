// School Year
export interface SchoolYear {
    id: number;
    year_start: number;
    year_end: number;
    label: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    created_at?: string;
    updated_at?: string;
}

// Classroom
export interface Classroom {
    id: number;
    name: string;
    code: string;
    cycle: 'primaire' | 'college' | 'lycee';
    level: string;
    created_at?: string;
    updated_at?: string;
}

// Subject
export interface Subject {
    id: number;
    name: string;
    code: string;
    created_at?: string;
    updated_at?: string;
}

// ClassroomSubject (with coefficient)
export interface ClassroomSubject {
    id: number;
    classroom_id: number;
    subject_id: number;
    coefficient: number;
    classroom?: Classroom;
    subject?: Subject;
    created_at?: string;
    updated_at?: string;
}

// User
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'director' | 'teacher' | 'student' | 'parent';
    phone?: string;
    created_at?: string;
    updated_at?: string;
}

// Student
export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    matricule: string;
    birth_date?: string;
    gender?: 'M' | 'F';
    address?: string;
    user_id?: number;
    parent_user_id?: number;
    user?: User;
    parent?: User;
    created_at?: string;
    updated_at?: string;
}

// Teacher
export interface Teacher {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    phone?: string;
    specialization?: string;
    birth_date?: string;
    user?: User;
    created_at?: string;
    updated_at?: string;
}

// Enrollment
export interface Enrollment {
    id: number;
    student_id: number;
    classroom_id: number;
    school_year_id: number;
    enrolled_at?: string;
    student?: Student;
    classroom?: Classroom;
    school_year?: SchoolYear;
    created_at?: string;
    updated_at?: string;
}

// Assignment
export interface Assignment {
    id: number;
    title: string;
    description?: string;
    type: 'devoir' | 'evaluation' | 'examen';
    max_score: number;
    due_date: string;
    classroom_id: number;
    subject_id: number;
    school_year_id: number;
    created_by?: number;
    classroom?: Classroom;
    subject?: Subject;
    school_year?: SchoolYear;
    creator?: User;
    created_at?: string;
    updated_at?: string;
}

// Grade
export interface Grade {
    id: number;
    student_id: number;
    assignment_id: number;
    score?: number;
    notes?: string;
    graded_by?: number;
    graded_at?: string;
    student?: Student;
    assignment?: Assignment;
    grader?: Teacher;
    created_at?: string;
    updated_at?: string;
}

// ReportCard
export interface ReportCard {
    id: number;
    student_id: number;
    school_year_id: number;
    classroom_id: number;
    average?: number;
    rank?: number;
    comments?: string;
    generated_at?: string;
    student?: Student;
    school_year?: SchoolYear;
    classroom?: Classroom;
    created_at?: string;
    updated_at?: string;
}

// ClassroomSubjectTeacher
export interface ClassroomSubjectTeacher {
    id: number;
    classroom_subject_id: number;
    teacher_id: number;
    school_year_id: number;
    classroom_subject?: ClassroomSubject;
    teacher?: Teacher;
    school_year?: SchoolYear;
    created_at?: string;
    updated_at?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}
