import styles from "./UserSection.module.css";
import { Tooltip, Icon, AvatarStatus, Menu } from "..";
import useUserData from "../../hooks/useUserData";
import useLogout from "../../hooks/useLogout";
import { useState } from "react";
import Image from "next/image";

const UserSection = () => {
    const [hover, setHover] = useState(false);
    const [showMenu, setShowMenu] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const {
        auth,
        setShowSettings,
    } = useUserData();
    const { logout } = useLogout();

    const menuItems = [
        { name: "Profile", func: () => { } },
        { name: "Set Status", func: () => { } },
        { name: "Divider" },
        { name: "Logout", icon: "logout", func: () => logout() },
        { name: "Divider" },
        {
            name: "Copy ID", icon: "id", func: () => {
                navigator.clipboard.writeText(auth?.user?._id);
            }
        },
    ]

    return (
        <div className={styles.userSectionContainer}>
            <div className={styles.userSection}>
                <div
                    className={styles.avatarWrapper}
                    onClick={() => setShowMenu(!showMenu)}
                    style={{ backgroundColor: showMenu && "var(--background-hover-1)" }}
                    onFocus={() => setHover("user")}
                    onBlur={() => setHover(false)}
                    onMouseEnter={() => setHover("user")}
                    onMouseLeave={() => setHover(false)}
                    tabIndex={0}
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
                            background={hover === "user" || showMenu
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

                    {
                        showMenu &&
                        <Menu
                            items={menuItems}
                            position={{
                                bottom: "calc(100% + 12px)",
                                left: "0px",
                            }}
                            setMenu={{ func: () => setShowMenu(null) }}
                        />
                    }
                </div>

                <div className={styles.toolbar}>
                    <button
                        onFocus={() => setShowTooltip(1)}
                        onBlur={() => setShowTooltip(null)}
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
                        onFocus={() => setShowTooltip(2)}
                        onBlur={() => setShowTooltip(null)}
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
                        onFocus={() => setShowTooltip(3)}
                        onBlur={() => setShowTooltip(null)}
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
