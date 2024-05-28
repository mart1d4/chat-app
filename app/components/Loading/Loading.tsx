"use client";

import { useData, usePusher, useWindowSettings } from "@/store";
import { Channels, Guilds, Users } from "@/lib/db/types";
import styles from "./Loading.module.css";
import { use, useEffect } from "react";
import Pusher from "pusher-js";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function Loading({
    children,
    data,
}: {
    children: React.ReactNode;
    data: {
        user: Partial<Users>;
        friends: Partial<Users>[];
        blocked: Partial<Users>[];
        received: Partial<Users>[];
        sent: Partial<Users>[];
        channels: Partial<Channels>[];
        guilds: Partial<Guilds>[];
    };
}) {
    const setReceived = useData((state) => state.setReceived);
    const setChannels = useData((state) => state.setChannels);
    const setFriends = useData((state) => state.setFriends);
    const setBlocked = useData((state) => state.setBlocked);
    const setGuilds = useData((state) => state.setGuilds);
    const setSent = useData((state) => state.setSent);
    const setUser = useData((state) => state.setUser);

    const setWidthThreshold = useWindowSettings((state) => state.setWidthThreshold);
    const widthThresholds = useWindowSettings((state) => state.widthThresholds);
    const setShiftDown = useWindowSettings((state) => state.setShiftKeyDown);

    const setPusher = usePusher((state) => state.setPusher);
    const pusher = usePusher((state) => state.pusher);
    const user = useData((state) => state.user);

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
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Shift") {
                setShiftDown(true);
            }
        }

        function handleKeyUp(e: KeyboardEvent) {
            if (e.key === "Shift") {
                setShiftDown(false);
            }
        }

        function handleWindowBlur() {
            setShiftDown(false);
        }

        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        setUser(data.user);
        setFriends(data.friends);
        setBlocked(data.blocked);
        setReceived(data.received);
        setSent(data.sent);
        setChannels(data.channels);
        setGuilds(data.guilds);
    }, []);

    useEffect(() => {
        return;

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
    }, []);

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

    return (
        <div
            onDrag={(e) => e.preventDefault()}
            onDragEnd={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {user ? (
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
