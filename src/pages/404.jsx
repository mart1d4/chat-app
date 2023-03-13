import { useEffect } from "react";
import { useRouter } from "next/router";

const Custom404 = () => {
    const router = useRouter();

    useEffect(() => {
        router.push("/channels/@me");
    }, []);

    return (
        <div>
            <h1>404 - Page Not Found</h1>
        </div>
    );
}

export default Custom404;
