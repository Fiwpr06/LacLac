export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export const ok = <T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T> => ({
  success: true,
  data,
  message,
  meta,
});
