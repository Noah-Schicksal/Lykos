export interface CreateCourseDTO {
    title: string;
    description: string;
    price?: number;
    coverImageUrl?: string;
    maxStudents?: number;
    categoryId?: string;
}

export interface UpdateCourseDTO {
    title?: string;
    description?: string;
    price?: number;
    coverImageUrl?: string;
    maxStudents?: number;
    categoryId?: string;
    isActive?: boolean;
}

export interface CourseStudentDTO {
    id: string;
    name: string;
    email: string;
    enrolledAt: Date;
}
