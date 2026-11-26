/**
 * Typed API client (guideline §10.6): komponentlər və service-lər axios-u birbaşa
 * görmür — yalnız bu wrapper-i. Axın: UI → Query Hooks → Services → API Client.
 */

import type { AxiosRequestConfig } from 'axios'

import { httpClient } from './axios'

export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.get<T>(url, config)
    return response.data
  },

  async post<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await httpClient.post<T>(url, body, config)
    return response.data
  },

  async put<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await httpClient.put<T>(url, body, config)
    return response.data
  },

  async patch<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await httpClient.patch<T>(url, body, config)
    return response.data
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await httpClient.delete<T>(url, config)
    return response.data
  },
}
