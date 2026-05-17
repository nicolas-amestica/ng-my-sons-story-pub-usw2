/**
 * @description Envoltura estándar del backend Serverless (`helpers/responses.js`).
 */
export interface ApiResponseWrapper<T> {
  state: boolean;
  metadata?: {
    action?: string;
    statusCode?: number;
    [key: string]: unknown;
  };
  data: T;
}
