import { getUser } from "@/lib/db/helpers";
import Link from "next/link";

const AuthButton = async ({ link }: { link: string }) => {
    const user = await getUser({});
    return <Link href={link}>{user ? "Open Chat App" : link === "register" ? "Sign up" : "Login"}</Link>;
};

export default AuthButton;
