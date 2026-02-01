export interface MyCourseDTO {
    id: string;
    title: string;
    description: string;
    coverImageUrl?: string;
    categoryId?: string;
    enrolledAt: Date;
    progress: number;
    totalClasses: number;
    completedClasses: number;
    certificateHash?: string | null;
}

export interface ClassStatusDTO {
    id: string;
    title: string;
    videoUrl?: string;
    description?: string;
    materialUrl?: string;
    completed: boolean;
}

export interface ModuleStatusDTO {
    id: string;
    title: string;
    orderIndex: number;
    classes: ClassStatusDTO[];
}

export interface CourseDetailsDTO {
    id: string;
    title: string;
    description: string;
    progress: number;
    modules: ModuleStatusDTO[];
}

export interface CertificateDTO {
    certificateHash: string;
    issuedAt: Date;
    courseTitle: string;
    studentName: string;
    validationUrl: string;
}
