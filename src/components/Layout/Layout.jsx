import { AppNav, Loader } from "../";
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
        setFriendRequests,
        setBlockedUsers,
        setChannelList,
    } = useUserData();

    useEffect(() => {
        if (isLoading) return;
        if (!auth?.accessToken) router.push("/login");

        let isMounted = true;
        const controller = new AbortController();

        const getFriends = async () => {
            const res = await axiosPrivate.get(
                `/users/${auth?.user?._id}/friends`,
                { signal: controller.signal }
            );
            isMounted && setFriends(res.data);
        };

        const getFriendRequests = async () => {
            const res = await axiosPrivate.get(
                `/users/${auth?.user?._id}/friendRequests`,
                { signal: controller.signal }
            );
            isMounted && setFriendRequests(res.data);
        };

        const getBlockedUsers = async () => {
            const res = await axiosPrivate.get(
                `/users/${auth?.user?._id}//blocked`,
                { signal: controller.signal }
            );
            isMounted && setBlockedUsers(res.data);
        };

        const getChannelList = async () => {
            const res = await axiosPrivate.get(
                `/users/${auth?.user?._id}/private/channels`,
                { signal: controller.signal }
            );
            isMounted && setChannelList(res.data);
        };

        getFriends();
        getFriendRequests();
        getBlockedUsers();
        getChannelList();
        console.log(
            '%c[AuthProvider]',
            'color: hsl(38, 96%, 54%)',
            ': Fetching data...'
        );

        setIsFetching(false);

        return () => {
            controller.abort();
            isMounted = false;
        };
    }, [isLoading]);

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
