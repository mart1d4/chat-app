import { getUser } from "@/lib/db/helpers";
import styles from "./Header.module.css";
import Link from "next/link";

const links = [
    { name: "Download", href: "/download" },
    { name: "Discover", href: "/" },
    { name: "Support", href: "/" },
    { name: "Blog", href: "/" },
];

export default async function Header() {
    const user = await getUser({});

    return (
        <>
            <div className={styles.disclaimer}>
                <div>
                    Notice: This is not Discord and is not affiliated with Discord in any way. This
                    is a chat application which follows Discord's design. Passwords are hashed and
                    salted and messages are safe to send. See the source code{" "}
                    <Link
                        href="https://github.com/mart1d4/spark"
                        target="_blank"
                    >
                        here
                    </Link>
                    .
                </div>
            </div>

            <header className={styles.header}>
                <nav>
                    <Link
                        href="/"
                        aria-label="Home"
                        className={styles.brand}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="58"
                            height="58"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="#FFFFFF"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 11h14v-3h-14z" />
                            <path d="M17.5 11l-1.5 10h-8l-1.5 -10" />
                            <path d="M6 8v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1" />
                            <path d="M15 5v-2" />
                        </svg>
                    </Link>

                    <div className={styles.navLinks}>
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={styles.navLink}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.appButton}>
                        <Link href="login">{user ? "Open Spark" : "Login"}</Link>
                    </div>
                </nav>
            </header>
        </>
    );
}
