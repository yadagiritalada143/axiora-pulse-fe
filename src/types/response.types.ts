/** Envelope returned by every backend REST endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
