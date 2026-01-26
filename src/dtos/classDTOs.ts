export interface CreateClassDTO {
    title: string;
    description?: string;
    videoUrl?: string;
    materialUrl?: string;
}

export interface UpdateClassDTO {
    title?: string;
    description?: string;
    videoUrl?: string;
    materialUrl?: string;
}

export interface ClassProgressDTO {
    classId: string;
    userId: string;
    completedAt: Date;
}
