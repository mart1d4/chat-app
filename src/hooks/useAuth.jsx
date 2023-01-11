import { useContext, useDebugValue } from "react";
import { AuthContext } from "../context/AuthProvider";

export default function useAuth() {
    const { auth } = useContext(AuthContext);
    useDebugValue(auth, (auth) => (auth?.user ? 'Logged In' : 'Logged Out'));
    return useContext(AuthContext);
}
