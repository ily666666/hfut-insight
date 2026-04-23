import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { message } from 'ant-design-vue';

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    return config;
  },
  (err) => Promise.reject(err),
);

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code !== 0) {
        message.error(data.message || '接口异常');
        return Promise.reject(data);
      }
      return data.data;
    }
    return data;
  },
  (err) => {
    const msg = err?.response?.data?.message || err.message || '网络异常';
    message.error(msg);
    return Promise.reject(err);
  },
);

export function http<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return request.request<T, T>(config);
}

export default request;
