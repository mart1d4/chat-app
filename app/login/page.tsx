import { redirect } from "next/navigation";
import styles from "../Auth.module.css";
import { isLoggedIn } from "@/lib/auth";
import Link from "next/link";
import Form from "./Form";

export default async function LoginPage() {
    const isLogged = await isLoggedIn();
    if (isLogged) redirect("/channels/me");

    return (
        <div className={styles.wrapper}>
            <div className={styles.disclaimer}>
                <p>
                    Notice: This is not Discord and is not affiliated with Discord in any way. This is a chat
                    application which follows Discord's design. All passwords and messages are encrypted. See the source
                    code{" "}
                    <Link
                        href="https://github.com/mart1d4/chat-app"
                        target="_blank"
                    >
                        here
                    </Link>
                    .
                </p>
            </div>

            <form>
                <div className={styles.loginContainer}>
                    <div className={styles.header}>
                        <h1>Welcome back!</h1>
                        <div>We're so excited to see you again!</div>
                    </div>

                    <Form />
                </div>
            </form>
        </div>
    );
}
