import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '/api';

export default axios.create({
    baseURL: BASE_URL,
    validateStatus: (status) => status >= 200 && status < 500,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    validateStatus: (status) => status >= 200 && status < 500,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
