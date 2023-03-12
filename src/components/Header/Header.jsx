import styles from "./Header.module.css";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";

const navLinks = [
    {
        name: "Home",
        href: "/",
    },
    {
        name: "Nitro",
        href: "/nitro",
    },
    {
        name: "About",
        href: "/about",
    },
    {
        name: "Contact",
        href: "/contact",
    },
];

const Header = () => {
    const [isHovered, setIsHovered] = useState(null);
    const { auth } = useAuth();

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <a href="/" className={styles.logo}>
                    Unthrust
                </a>

                {/* <nav>
                    <ul className={styles.links}>
                        {navLinks.map((link) => (
                            <li
                                key={link.name}
                                onMouseEnter={() => setIsHovered(link.name)}
                                onMouseLeave={() => setIsHovered(null)}
                            >
                                <Link href={link.href} className={styles.link}>
                                    {link.name}
                                </Link>

                                <AnimatePresence>
                                    {isHovered === link.name && (
                                        <motion.div
                                            layoutId="underline"
                                            className={styles.underline}
                                            initial={{
                                                opacity: 0.5,
                                            }}
                                            animate={{
                                                opacity: 1,
                                            }}
                                            exit={{
                                                opacity: 0.5,
                                            }}
                                            transition={{
                                                duration: 0.15,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </li>
                        ))}
                    </ul>
                </nav> */}

                <div className={styles.buttons}>
                    {auth?.accessToken ? (
                        <Link href="/login">Start chatting</Link>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/register">Register</Link>
                        </>
                    )}
                </div>
            </header>
        </div>
    );
};

export default Header;
