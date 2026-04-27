import axios from 'axios';

const AUTH_API = 'http://localhost:5002/api';
const MAIN_API = 'http://localhost:5000/api';

// Create axios instance
const authApiInstance = axios.create({
    baseURL: AUTH_API,
    headers: { 'Content-Type': 'application/json' },
});

const mainApiInstance = axios.create({
    baseURL: MAIN_API,
    headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
const addInterceptor = (instance) => {
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response?.status === 401) {
                console.warn("401 - Token có thể sai hoặc hết hạn");
            }
            return Promise.reject(err);
        }
    );
};

addInterceptor(authApiInstance);
addInterceptor(mainApiInstance);

// Auth + User API
export const authApi = {
    login: (username, password) =>
        authApiInstance.post('/auth/login', { username, password }),
    register: (data) =>
        authApiInstance.post('/auth/register', data),
};

export const userApi = {
    getAll: (params) => authApiInstance.get('/users', { params }),
    getById: (id) => authApiInstance.get(`/users/${id}`),
    create: (data) => authApiInstance.post('/users', data),
    update: (id, data) => authApiInstance.put(`/users/${id}`, data),
    delete: (id) => authApiInstance.delete(`/users/${id}`),
};

// Product API
export const productApi = {
    getAll: (params) => mainApiInstance.get('/products', { params }),
    search: (params) => mainApiInstance.get('/products', { params }),
    getById: (id) => mainApiInstance.get(`/products/${id}`),
    create: (data) => mainApiInstance.post('/products', data),
    update: (id, data) => mainApiInstance.put(`/products/${id}`, data),
    delete: (id) => mainApiInstance.delete(`/products/${id}`),
};

// Product Type API
export const productTypeApi = {
    getAll: () => mainApiInstance.get('/ProductTypes'),
    getById: (id) => mainApiInstance.get(`/ProductTypes/${id}`),
    create: (data) => mainApiInstance.post('/ProductTypes', data),
    update: (id, data) => mainApiInstance.put(`/ProductTypes/${id}`, data),
    delete: (id) => mainApiInstance.delete(`/ProductTypes/${id}`),
};

// Order API
export const orderApi = {
    getAll: () => mainApiInstance.get('/orders'),
    getById: (id) => mainApiInstance.get(`/orders/${id}`),
    create: (data) => mainApiInstance.post('/orders', data),
};
