import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useAuth() {
    const {
        auth,
        setAuth,
        isLoading,
        setIsLoading,
    } = useContext(AuthContext);
    return useContext(AuthContext);
}
