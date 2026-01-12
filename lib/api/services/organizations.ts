/**
 * Organizations Service
 * 
 * Сервис для работы с организациями и инвайтами.
 */

import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { AuthResponse, Organization, Invite } from '../types';

export interface CreateOrganizationInput {
  organizationName: string;
  managerName: string;
  managerEmail: string;
  managerPassword: string;
  managerPhone?: string;
}

export interface CreateInviteInput {
  phone: string;
}

export interface RegisterByInviteInput {
  inviteCode: string;
  name: string;
  email: string;
  password: string;
  position?: string;
}

export interface CreateOrganizationResponse extends AuthResponse {
  organization: Organization;
}

export interface InviteResponse {
  invite: Invite;
}

export interface InvitesListResponse {
  invites: Invite[];
}

export const organizationsService = {
  /**
   * Создать новую организацию с менеджером
   */
  async createOrganization(input: CreateOrganizationInput) {
    return apiClient.post<CreateOrganizationResponse>(
      API_CONFIG.ENDPOINTS.CREATE_ORGANIZATION,
      input,
      { skipAuth: true }
    );
  },

  /**
   * Получить информацию о своей организации
   */
  async getMyOrganization() {
    return apiClient.get<Organization>(API_CONFIG.ENDPOINTS.MY_ORGANIZATION);
  },

  /**
   * Создать приглашение для сотрудника
   */
  async createInvite(input: CreateInviteInput) {
    return apiClient.post<InviteResponse>(API_CONFIG.ENDPOINTS.INVITES, input);
  },

  /**
   * Получить список приглашений
   */
  async getInvites() {
    return apiClient.get<InvitesListResponse>(API_CONFIG.ENDPOINTS.INVITES);
  },

  /**
   * Удалить приглашение
   */
  async deleteInvite(inviteId: string) {
    return apiClient.delete(API_CONFIG.ENDPOINTS.INVITE(inviteId));
  },

  /**
   * Зарегистрироваться по инвайт-коду
   */
  async registerByInvite(input: RegisterByInviteInput) {
    return apiClient.post<CreateOrganizationResponse>(
      API_CONFIG.ENDPOINTS.REGISTER_BY_INVITE,
      input,
      { skipAuth: true }
    );
  },
};
