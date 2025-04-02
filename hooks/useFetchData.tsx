import type { ResponseMessage, UserProfile } from "@/type";
import type { SWRInfiniteKeyLoader } from "swr/infinite";
import { getApiUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { useTriggerDialog } from "@/store";
import useSWRInfinite from "swr/infinite";
import useSWR from "swr";

export default function fetchHelper() {
    const { triggerDialog } = useTriggerDialog();
    const router = useRouter();

    async function request(url: string, attempts = 1) {
        try {
            if (attempts > 3) {
                throw new Error("Request failed after 3 attemps");
            }

            const token = localStorage.getItem("token");

            const response = await fetch(`${getApiUrl}${url}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                const refreshResponse = await fetch(`${getApiUrl}/auth/refresh`, {
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
                triggerDialog({ type: "RATE_LIMIT " });

                const retryAfter = response.headers.get("Retry-After");
                const after = parseInt(retryAfter || "5") * 1000;

                await new Promise((resolve) => setTimeout(resolve, after));
                return request(url, attempts + 1);
            } else if (!response.ok) {
                const data = await response.json();
                throw { errors: data.errors || { server: "Something went wrong." } };
            } else {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            throw { errors: { server: "Something went wrong." } };
        }
    }

    return { request };
}

type FetchUserResponse = {
    user: UserProfile;
    mutualFriends: number[];
    mutualGuilds: number[];
};

export function useFetchUser(id: number) {
    const { data, error, isLoading, mutate } = useSWR<FetchUserResponse, Error>(
        `/users/${id}/profile?withMutualGuilds=true&withMutualFriends=true`,
        fetchHelper().request,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return {
        data: {
            user: data?.user,
            mutualFriends: data?.mutualFriends,
            mutualGuilds: data?.mutualGuilds,
        },
        mutate,
        isLoading,
        isError: error,
    };
}

export function useFetchNote(userId: number) {
    const { data, error, isLoading } = useSWR<{ note: string }, Error>(
        `/users/@me/notes/${userId}`,
        fetchHelper().request,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return {
        data: data?.note,
        isLoading,
        isError: error,
    };
}

export function useFetchPinnedMessages(channelId: number) {
    const { data, error, isLoading } = useSWR<ResponseMessage[], Error>(
        `/channels/${channelId}/messages/pinned`,
        fetchHelper().request,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return {
        data,
        isLoading,
        isError: error,
    };
}

export function useFetchMessages(channelId: number, limit: number) {
    const getKey: SWRInfiniteKeyLoader = (_, previousData) => {
        const baseUrl = `/channels/${channelId}/messages?limit=`;

        if (previousData) {
            if (previousData.length < limit) {
                return null;
            }

            const last = previousData[previousData.length - 1];
            return `${baseUrl}${limit}&before=${last.createdAt}`;
        }

        return `${baseUrl}${limit}`;
    };

    const { data, isLoading, mutate, size, setSize } = useSWRInfinite<ResponseMessage[], Error>(
        getKey,
        fetchHelper().request,
        {
            errorRetryCount: 0,
            revalidateIfStale: true,
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
        }
    );

    return {
        data,
        isLoading,
        mutate,
        size,
        setSize,
    };
}
