import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useUserData from "./useUserData";

export default function PersistLogin({ children }) {
    const refresh = useRefreshToken();
    const { auth, setIsLoading } = useUserData();

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
    }, [auth]);

    return children;
}
