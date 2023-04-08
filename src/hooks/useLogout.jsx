import axios from "../api/axios";
import { useRouter } from "next/router";
import useAuth from "./useAuth";
import useUserData from "./useUserData";

export default function useLogout() {
    const { setAuth } = useAuth();
    const { channels } = useUserData();
    const router = useRouter();

    const logout = async () => {
        setAuth({});
        localStorage.removeItem("channel-url");
        localStorage.removeItem("friends-tab");
        localStorage.removeItem("user-settings");

        channels.forEach(channel => {
            localStorage.removeItem(`channel-${channel._id}`);
        });

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
