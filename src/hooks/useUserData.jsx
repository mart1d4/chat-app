import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useUserData() {
    const { friends, friendRequestsSent, friendRequestsReceived, blockedUsers, channels } = useContext(AuthContext);
    return useContext(AuthContext);
}
