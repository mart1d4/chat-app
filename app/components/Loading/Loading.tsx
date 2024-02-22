"use client";

import { useData, useNotifications, usePusher, useWidthThresholds } from "@/lib/store";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./Loading.module.css";
import Pusher from "pusher-js";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function Loading({ children, data }: Props) {
    const setReceived = useData((state) => state.setReceived);
    const setChannels = useData((state) => state.setChannels);
    const setFriends = useData((state) => state.setFriends);
    const setBlocked = useData((state) => state.setBlocked);
    const setGuilds = useData((state) => state.setGuilds);
    const setToken = useData((state) => state.setToken);
    const setSent = useData((state) => state.setSent);
    const setUser = useData((state) => state.setUser);

    const removeUser = useData((state) => state.removeUser);
    const modifyUser = useData((state) => state.modifyUser);
    const addUser = useData((state) => state.addUser);

    const updateChannel = useData((state) => state.updateChannel);
    const removeChannel = useData((state) => state.removeChannel);
    const moveChannelUp = useData((state) => state.moveChannelUp);
    const removeGuild = useData((state) => state.removeGuild);
    const updateGuild = useData((state) => state.updateGuild);
    const addChannel = useData((state) => state.addChannel);
    const addGuild = useData((state) => state.addGuild);

    const setWidthThreshold = useWidthThresholds((state) => state.setWidthThreshold);
    const widthThresholds = useWidthThresholds((state) => state.widthThresholds);

    const setPusher = usePusher((state) => state.setPusher);
    const pusher = usePusher((state) => state.pusher);

    const addPing = useNotifications((state) => state.addPing);

    const channels = useData((state) => state.channels);
    const guilds = useData((state) => state.guilds);

    const token = useData((state) => state.token);
    const user = useData((state) => state.user);

    const hasRendered = useRef(false);
    const pathname = usePathname();

    function updateWidths(width: number) {
        for (const [k, value] of Object.entries(widthThresholds)) {
            const key = parseInt(k);

            if (width >= key) {
                if (!value) setWidthThreshold(key, true);
            } else {
                if (value) setWidthThreshold(key, false);
            }
        }
    }

    useEffect(() => {
        const width = window.innerWidth;
        updateWidths(width);

        function handleResize() {
            const width = window.innerWidth;
            updateWidths(width);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [widthThresholds]);

    useEffect(() => {
        const env = process.env.NODE_ENV;

        const setAuthContext = async () => {
            const response = await fetch(`${apiUrl}/auth/refresh`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => res.json())
                .catch(() => {
                    console.log("Error fetching /auth/refresh");
                });

            if (response.token) {
                setUser({
                    ...data.user,
                    id: parseInt(data.user.id),
                });
                setFriends(data.friends);
                setBlocked(data.blocked);
                setReceived(data.received);
                setSent(data.sent);
                setChannels(data.channels);
                setGuilds(data.guilds);
                setToken(response.token);
            }
        };

        if (env === "development" && !hasRendered.current) {
            return () => {
                hasRendered.current = true;
            };
        }

        setAuthContext();
    }, []);

    useEffect(() => {
        if (!token) return;

        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) {
            throw new Error("Pusher key or cluster not found.");
        }

        const pusher: Pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
            userAuthentication: {
                endpoint: `${apiUrl}/auth/pusher`,
                transport: "ajax",
                params: {},
                headers: {},
            },
        });

        pusher.bind("pusher:signin_success", (data) => {
            console.log("Subscription succeeded", data);
        });

        pusher.bind("pusher:error", (data) => {
            console.log("Subscription error", data);
        });

        pusher.signin();
        setPusher(pusher);

        return () => {
            pusher.disconnect();
        };
    }, [token]);

    useEffect(() => {
        if (!pusher || !user) return;

        const channel = pusher.subscribe("private-user-" + user.id);

        console.log("Fucking shit subscribed");

        channel.bind("message", (data) => {
            console.log("Received message", data);
        });

        return () => {
            pusher.unsubscribe("private-user-" + user.id);
        };
    }, [pusher, user]);

    // useEffect(() => {
    //     console.log("Pathname changed", pathname);

    //     pusher.bind("message", (data) => {
    //         console.log("Received message");

    //         if (channels.find((channel) => channel.id == data.channelId)) {
    //             if (!pathname.includes(data.channelId)) {
    //                 // Play sound
    //                 const audio = new Audio("/assets/sounds/ping.mp3");
    //                 audio.volume = 0.5;
    //                 audio.play();
    //                 addPing(data.channelId);
    //             }

    //             if (channels[0].id != data.channelId) {
    //                 moveChannelUp(data.channelId);
    //             }
    //         }
    //     });

    //     return () => {
    //         pusher.unbind("message");
    //     };
    // }, [channels, pathname]);

    return (
        <div
            onDrag={(e) => e.preventDefault()}
            onDragEnd={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {token ? (
                children
            ) : (
                <div className={styles.container}>
                    <video
                        autoPlay
                        loop
                    >
                        <source
                            src="/assets/app/spinner.webm"
                            type="video/webm"
                        />
                    </video>

                    <div className={styles.textContent}>
                        <div className="smallTitle">Did you know</div>
                        <div>
                            Use{" "}
                            <div className="keybind">
                                <span>CTRL /</span>
                            </div>{" "}
                            to bring up the list of keyboard shortcuts.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
