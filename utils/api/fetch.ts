/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import axiosInstance from "./apiInstance";


// Generic GET
export const getFetch = async <T = any>(
  url: string
): Promise<AxiosResponse<T>> => {
  return await axiosInstance.get<T>(url);
};

export const getFetch2 = async <T = any>(url: string): Promise<T> => {
  const response = await axiosInstance.get<T>(url);
  return response.data; 
};


// Generic POST
export const postFetch = async <T = any, D = any>(
  url: string,
  body: D
): Promise<AxiosResponse<T>> => {
  return await axiosInstance.post<T>(url, body);
};


// Generic DELETE
export const deleteFetch = async <T = any>(
  url: string
): Promise<AxiosResponse<T>> => {
  return await axiosInstance.delete<T>(url);
};

// Generic PUT
export const putFetch = async <T = any, D = any>(
  url: string,
  body: D
): Promise<AxiosResponse<T>> => {
  return await axiosInstance.put<T>(url, body);
};

// Generic PATCH
export const patchFetch = async <T = any, D = any>(
  url: string,
  body: D
): Promise<AxiosResponse<T>> => {
  return await axiosInstance.patch<T>(url, body);
};