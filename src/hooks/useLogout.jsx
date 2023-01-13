import axios from "../api/axios";
import useAuth from "./useAuth";
import { useRouter } from "next/router";

export default function useLogout() {
    const { setAuth } = useAuth();
    const router = useRouter();

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("url");
        localStorage.removeItem("friendsContent");
        router.push("/login");
        try {
            await axios('/auth/logout', {
                withCredentials: true
            });
        } catch (err) {
            console.error(err);
        }
    };

    return { logout };
}
