export interface CertificateValidationDTO {
    certificateHash: string;
    isValid: boolean;
    studentName: string;
    courseTitle: string;
    workloadHours: number;
    instructorName: string;
    issuedAt: Date;
}

export interface CertificateValidationResponseDTO {
    data: CertificateValidationDTO;
}
