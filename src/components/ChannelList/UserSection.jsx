import styles from "./UserSection.module.css";
import { Tooltip, Icon, AvatarStatus } from "..";
import useLogout from "../../hooks/useLogout";
import { useState } from "react";
import Image from "next/image";
import useAuth from "../../hooks/useAuth";
import useComponents from "../../hooks/useComponents";

const UserSection = () => {
    const [hover, setHover] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const { auth } = useAuth();
    const {
        setShowSettings,
        setUserProfile,
        setMenu,
    } = useComponents();
    const { logout } = useLogout();

    const menuItems = [
        { name: "Profile", func: () => setUserProfile({ user: auth?.user }) },
        { name: "Set Status", func: () => { } },
        { name: "Divider" },
        { name: "Logout", icon: "logout", func: () => logout() },
        { name: "Divider" },
        {
            name: "Copy ID", icon: "id", func: () => {
                navigator.clipboard.writeText(auth?.user?._id);
            }
        },
    ];

    return (
        <div className={styles.userSectionContainer}>
            <div className={styles.userSection}>
                <div
                    className={styles.avatarWrapper}
                    onClick={(e) => setMenu({
                        items: menuItems,
                        event: e,
                    })}
                    onMouseEnter={() => setHover("user")}
                    onMouseLeave={() => setHover(false)}
                >
                    <div>
                        {auth?.user?.avatar && (
                            <Image
                                src={auth?.user?.avatar}
                                width={32}
                                height={32}
                                alt="Avatar"
                            />
                        )}
                        <AvatarStatus
                            status={auth?.user?.status}
                            background={hover === "user"
                                ? "var(--background-hover-1)" : "var(--background-2)"}
                        />
                    </div>
                    <div className={styles.contentWrapper}>
                        <div>
                            {auth?.user?.username}
                        </div>
                        <div>
                            {auth?.user?.customStatus === null
                                ? "#0001"
                                : auth?.user?.customStatus}
                        </div>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <button
                        onMouseEnter={() => setShowTooltip(1)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <Tooltip show={showTooltip === 1}>
                            Mute
                        </Tooltip>
                        <div className={styles.toolbar}>
                            <Icon name="mic" size="20" />
                        </div>
                    </button>

                    <button
                        onMouseEnter={() => setShowTooltip(2)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <Tooltip show={showTooltip === 2}>
                            Deafen
                        </Tooltip>
                        <div className={styles.toolbar}>
                            <Icon name="headset" size="20" />
                        </div>
                    </button>

                    <button
                        onMouseEnter={() => setShowTooltip(3)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowSettings(true)}
                    >
                        <Tooltip show={showTooltip === 3}>
                            User Settings
                        </Tooltip>
                        <div className={styles.toolbar}>
                            <Icon name="settings" size="20" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSection;
