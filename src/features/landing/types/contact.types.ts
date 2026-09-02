export interface ContactRequest {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
}
