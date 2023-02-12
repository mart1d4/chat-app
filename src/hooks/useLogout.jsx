import axios from "../api/axios";
import { useRouter } from "next/router";
import useAuth from "./useAuth";

export default function useLogout() {
    const { setAuth } = useAuth();
    const router = useRouter();

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("private-channel-url");
        localStorage.removeItem("friends-tab");
        try {
            const response = await axios('/auth/logout', {
                withCredentials: true
            });
            router.push('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return { logout };
}
