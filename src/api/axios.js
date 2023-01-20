import axios from 'axios';

export default axios.create({
    baseURL: "https://www.unthrust.com/api",
});

export const axiosPrivate = axios.create({
    baseURL: "https://www.unthrust.com/api",
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
