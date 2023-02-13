import { AppNav, Loader, Settings, UserProfile, Menu, Modal } from "../";
import { useEffect, useState } from "react";
import styles from "./Layout.module.css";
import useUserData from "../../hooks/useUserData";
import useAuth from "../../hooks/useAuth";
import useComponents from "../../hooks/useComponents";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";

const Layout = ({ children }) => {
    const [isFetching, setIsFetching] = useState(true);

    const axiosPrivate = useAxiosPrivate();
    const router = useRouter();
    const { auth, isLoading } = useAuth();
    const {
        showSettings,
        userProfile,
        modal,
    } = useComponents();
    const {
        setFriends,
        setRequests,
        setBlocked,
        setChannels,
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
            '%c[Layout]',
            'color: hsl(38, 96%, 54%)',
            'Fetching data...'
        );

        return () => {
            controller.abort();
            isMounted = false;
        };
    }, [isLoading]);

    return (
        isLoading || isFetching ? (
            <Loader />
        ) : (
            <>
                <div
                    className={styles.container}
                    onDragStart={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <AnimatePresence>
                        {showSettings && <Settings />}
                    </AnimatePresence>

                    <AnimatePresence>
                        {userProfile && <UserProfile />}
                    </AnimatePresence>

                    <AnimatePresence>
                        {modal && <Modal />}
                    </AnimatePresence>

                    <AppNav />

                    <div className={styles.wrapper}>
                        {children}
                    </div>
                </div>

                <Menu />
            </>
        )
    );
};

export default Layout;
