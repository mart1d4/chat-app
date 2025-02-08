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

export default function LoginPage() {
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
            <Form />
        </div>
    );
}
