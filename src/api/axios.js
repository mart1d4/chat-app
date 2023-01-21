import axios from 'axios';

export default axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
