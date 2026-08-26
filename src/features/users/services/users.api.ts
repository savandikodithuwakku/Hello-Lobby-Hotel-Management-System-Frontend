import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type { Address, Pagination, Role, User, UserStatus } from "../../../shared/api/types.ts";

export interface UserListParams {
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface UserListResult {
  users: User[];
  pagination: Pagination;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string | undefined;
  role: Role;
  address: Address;
}

export interface UpdateUserPayload {
  name: string;
  phone: string | null;
  address: Address;
}

export const usersApi = {
  list: (params: UserListParams) => httpClient.get<UserListResult>(`/users${toQueryString(params)}`),
  get: (id: string) => httpClient.get<{ user: User }>(`/users/${id}`),
  create: (payload: CreateUserPayload) => httpClient.post<{ user: User }>("/users", payload),
  update: (id: string, payload: UpdateUserPayload) =>
    httpClient.patch<{ user: User }>(`/users/${id}`, payload),
  changeRole: (id: string, role: Role) =>
    httpClient.patch<{ user: User }>(`/users/${id}/role`, { role }),
  changeStatus: (id: string, status: UserStatus) =>
    httpClient.patch<{ user: User }>(`/users/${id}/status`, { status }),
  deactivate: (id: string) => httpClient.delete<{ user: User }>(`/users/${id}`),
  revokeSessions: (id: string) => httpClient.delete<null>(`/users/${id}/sessions`),

  /**
   * Permanent deletion. The API requires the account's email address in the
   * body as a deliberate second confirmation.
   */
  remove: (id: string, confirmEmail: string) =>
    httpClient.delete<null>(`/users/${id}/permanent`, { confirmEmail }),
};

export default usersApi;
