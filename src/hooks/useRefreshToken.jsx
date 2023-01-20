import axios from '../api/axios';
import useUserData from './useUserData';

export default function useRefreshToken() {
    const { setAuth } = useUserData();

    const refresh = async () => {
        const response = await axios.get('/auth/refresh', {
            withCredentials: true,
        });
        setAuth((prev) => {
            return {
                ...prev,
                accessToken: response.data.accessToken,
                user: response.data.user,
            };
        });
        return response.data.accessToken;
    };
    return refresh;
}
