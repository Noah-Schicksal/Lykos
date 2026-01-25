export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}
