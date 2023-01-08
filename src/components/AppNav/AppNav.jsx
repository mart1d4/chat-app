import Link from "next/link";
import styles from "./AppNav.module.css";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import icons from "../../../public/icons/icons";
import { Tooltip, Avatar } from "..";
import { useRef, useState, useEffect } from "react";
import useLogout from "../../hooks/useLogout";

const navLinks = [
    {
        name: "Dashboard",
        path: "/app",
        icon: icons.dashboard,
    },
    {
        name: "Friends",
        path: "/friends",
        icon: icons.friends,
    },
    {
        name: "Servers",
        path: "/servers",
        icon: icons.messages,
    },
    {
        name: "Account",
        path: "/account",
        icon: icons.user,
    },
];

const AppNav = () => {
    const { auth } = useAuth();
    const [show, setShow] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const { logout } = useLogout();
    const menuRef = useRef(null);

    useEffect(() => {
        document.addEventListener("click", (event) => {
            if (showMenu && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        });

        return () => {
            document.removeEventListener("click", () => setShowMenu(false));
        };
    }, []);

    const handleRoute = () => {
        if (localStorage.getItem("url")) {
            window.location.href = localStorage.getItem("url");
        } else {
            window.location.href = "/friends";
        }
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.logo}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    {icons.logo}
                </svg>
            </div>

            <ul className={styles.links}>
                {navLinks.map((link, index) => (
                    <Tooltip
                        key={index}
                        show={show === index}
                        text={link.name}
                        pos="right"
                        arrow
                    >
                        {link.name === "Friends" ? (
                            <li
                                className={styles.link}
                                onMouseEnter={() => setShow(index)}
                                onMouseLeave={() => setShow(null)}
                                onClick={() => handleRoute()}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    {link.icon}
                                </svg>
                            </li>
                        ) : (
                            <Link
                                href={link.path}
                                className={styles.link}
                                onMouseEnter={() => setShow(index)}
                                onMouseLeave={() => setShow(null)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    {link.icon}
                                </svg>
                            </Link>
                        )}
                    </Tooltip>
                ))}
            </ul>

            <div className={styles.account}>
                <div onClick={() => setShowMenu(!showMenu)}>
                    <Avatar
                        avatar={auth.user?.avatar}
                        username={auth.user?.username}
                        status={auth?.user?.status}
                        size="35px"
                    />
                </div>

                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            ref={menuRef}
                            className={styles.menu}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ul className={styles.menuList}>
                                <li>
                                    <Link
                                        href="/account"
                                        className={styles.menuLink}
                                    >
                                        Account
                                    </Link>
                                </li>
                                <li onClick={logout}>
                                    <Link
                                        href="/logout"
                                        className={styles.menuLink}
                                    >
                                        Logout
                                    </Link>
                                </li>
                                <li
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            auth.user?._id
                                        );
                                    }}
                                >
                                    Copy UserID
                                </li>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default AppNav;
