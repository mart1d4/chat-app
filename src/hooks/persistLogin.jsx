import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

export default function PersistLogin({ children }) {
    const refresh = useRefreshToken();
    const { auth, setIsLoading } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            const response = await refresh();
            isMounted && setIsLoading(false);
            response?.error && setIsLoading(false);
        };

        !auth?.accessToken
            ? verifyRefreshToken()
            : setIsLoading(false);

        return () => isMounted = false;
    }, []);

    return children;
}
