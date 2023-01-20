import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useUserData from "./useUserData";

export default function PersistLogin({ children }) {
    const refresh = useRefreshToken();
    const { auth, setIsLoading } = useUserData();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                console.error(err);
            }
        };

        !auth?.accessToken
            ? verifyRefreshToken()
            : setIsLoading(false);

        return () => isMounted = false;
    }, [auth]);

    return children;
}
