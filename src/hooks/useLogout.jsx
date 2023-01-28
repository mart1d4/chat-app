import axios from "../api/axios";
import useUserData from "./useUserData";
import { useRouter } from "next/router";

export default function useLogout() {
    const { setAuth } = useUserData();
    const router = useRouter();

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("private-channel-url");
        localStorage.removeItem("friends-tab");
        try {
            const response = await axios('/auth/logout', {
                withCredentials: true
            });
            console.log(response);
            router.push('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return { logout };
}
