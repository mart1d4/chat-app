import { LoadingDots } from "../components";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/helpers";
import styles from "../Auth.module.css";
import { Suspense } from "react";
import Link from "next/link";
import Form from "./Form";

const loading = (
    <div className={styles.wrapper}>
        <form>
            <div className={styles.loginContainer}>
                <div className={styles.header}>
                    <LoadingDots />
                </div>
            </div>
        </form>
    </div>
);

export default function RegisterPage() {
    return (
        <Suspense fallback={loading}>
            <Page />
        </Suspense>
    );
}

export async function Page() {
    const user = await getUser({});
    if (user) redirect("/channels/me");

    return (
        <div className={styles.wrapper}>
            <div className={styles.disclaimer}>
                <p>
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
                </p>
            </div>

            <Form />
        </div>
    );
}
