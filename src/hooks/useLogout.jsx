import axios from "../api/axios";
import useAuth from "./useAuth";

export default function useLogout() {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({});
        try {
            await axios('/auth/logout', {
                withCredentials: true
            }).then(() => {
                window.location.href = "/login";
            })
        } catch (err) {
            console.error(err);
        }
    };

    return { logout };
}
