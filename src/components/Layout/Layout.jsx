import { AppNav, Loader, Settings } from "../";
import { useEffect, useState } from "react";
import styles from "./Layout.module.css";
import useUserData from "../../hooks/useUserData";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
    const [isFetching, setIsFetching] = useState(true);

    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const {
        auth,
        isLoading,
        setFriends,
        setRequests,
        setBlocked,
        setChannels,
        showSettings,
    } = useUserData();

    useEffect(() => {
        if (isLoading) return;
        if (!auth?.accessToken) router.push("/login");

        let isMounted = true;
        const controller = new AbortController();

        const getFriends = async () => {
            const res = await axiosPrivate.get(
                `/users/@me/friends`,
                { signal: controller.signal }
            );
            isMounted && setFriends(res.data.friends);
        };

        const getRequests = async () => {
            const res = await axiosPrivate.get(
                `/users/@me/requests`,
                { signal: controller.signal }
            );
            isMounted && setRequests(res.data.requests);
        };

        const getBlocked = async () => {
            const res = await axiosPrivate.get(
                `/users/@me/blocked`,
                { signal: controller.signal }
            );
            isMounted && setBlocked(res.data.blocked);
        };

        const getChannels = async () => {
            const res = await axiosPrivate.get(
                `/users/@me/channels`,
                { signal: controller.signal }
            );
            isMounted && setChannels(res.data.channels);
            isMounted && setIsFetching(false);
        };

        getFriends();
        getRequests();
        getBlocked();
        getChannels();
        console.log(
            '%c[AuthProvider]',
            'color: hsl(38, 96%, 54%)',
            ': Fetching data...'
        );

        return () => {
            controller.abort();
            isMounted = false;
        };
    }, [isLoading]);

    if (showSettings) return <Settings />;

    return (
        isLoading || isFetching ? (
            <Loader />
        ) : (
            <div className={styles.container}>
                <AppNav />
                <div className={styles.wrapper}>
                    {children}
                </div>
            </div>
        )
    );
};

export default Layout;
