import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function fetchHelper() {
    const router = useRouter();

    async function request(url: string, attempts = 1) {
        try {
            if (attempts > 3) {
                throw new Error("Request failed after 3 attemps");
            }

            const token = localStorage.getItem("token");

            const response = await fetch(`${apiUrl}${url}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                });

                if (refreshResponse.status === 401) {
                    localStorage.removeItem("token");
                    router.push("/login");
                    throw new Error("Unauthorized");
                }

                const data = await refreshResponse.json();
                localStorage.setItem("token", data.token);

                return request(url, attempts + 1);
            } else if (response.status === 429) {
                // setLayers({
                //     settings: { type: "POPUP" },
                //     content: { type: "RATE_LIMIT" },
                // });

                const retryAfter = response.headers.get("Retry-After");
                const after = parseInt(retryAfter || "5") * 1000;

                await new Promise((resolve) => setTimeout(resolve, after));
                return request(url, attempts + 1);
            } else if (!response.ok) {
                const data = await response.json();
                throw { errors: data.errors || { server: "Something went wrong." } };
            } else {
                const data = await response.json();
                console.log(data);

                return data;
            }
        } catch (error) {
            throw { errors: { server: "Something went wrong." } };
        }
    }

    return { request };
}
