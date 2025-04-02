import { useData, useTriggerAlert, useTriggerDialog } from "@/store";
import { useAuthenticatedUser } from "./useAuthenticatedUser";
import { getApiUrl } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import type { Attachment } from "@/type";
import { useState } from "react";

type RequestState<R> = {
    send: (
        args: any,
        options?: { onComplete?: (data: R) => void; onFail?: (error: string) => void }
    ) => Promise<R>;
    isLoading: boolean;
    error: string | null;
    data: R | null;
    clearError: () => void;
    onComplete?: () => void;
    onFail?: () => void;
};

type RequestFunctions = Record<string, (...args: any[]) => Promise<any>>;

export function useRequests() {
    const { channels, addUser, removeUser } = useData();
    const { triggerDialog } = useTriggerDialog();
    const { triggerAlert } = useTriggerAlert();
    const user = useAuthenticatedUser();
    const router = useRouter();

    async function sendRequest({
        query,
        params,
        method,
        body,
        attemps = 0,
    }: {
        query: string;
        params?: Record<string, any>;
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
        body?: Record<string, any>;
        attemps?: number;
    }): Promise<{ data: any; errors: { message: string; status: number } | null }> {
        try {
            if (attemps > 3) {
                return {
                    data: null,
                    errors: {
                        message: "Too many attemps",
                        status: 401,
                    },
                };
            }

            const token = localStorage.getItem("token");
            let url = `${getApiUrl}${query}`;

            if (params) {
                const queryArr = Object.entries(params).map(([key, value]) => `${key}=${value}`);

                if (queryArr.length) {
                    url += `?${queryArr.join("&")}`;
                }
            }

            const shouldHaveBody = method === "POST" || method === "PUT" || method === "PATCH";

            const headers: {
                [key: string]: string;
            } = {
                Authorization: `Bearer ${token}`,
            };

            if (shouldHaveBody) {
                headers["Content-Type"] = "application/json";
            }

            const response = await fetch(url, {
                method,
                headers,
                body: shouldHaveBody ? JSON.stringify(body || {}) : undefined,
            });

            if (
                response.status === 401 &&
                !response.headers.get("Content-Type")?.includes("application/json")
            ) {
                const refreshResponse = await fetch(`${getApiUrl}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                });

                if (refreshResponse.status === 401) {
                    localStorage.removeItem("token");
                    router.push("/login");

                    return {
                        data: null,
                        errors: {
                            message: "Unauthorized",
                            status: 401,
                        },
                    };
                }

                const data = await refreshResponse.json();
                localStorage.setItem("token", data.token);

                return sendRequest({ query, params, method, body, attemps: attemps + 1 });
            } else if (response.status === 429) {
                triggerDialog({ type: "RATE_LIMIT" });

                const retryAfter = response.headers.get("Retry-After");
                const after = parseInt(retryAfter || "5") * 1000;

                await new Promise((resolve) => setTimeout(resolve, after));
                return sendRequest({ query, params, method, body, attemps: attemps + 1 });
            } else if (response.ok) {
                return {
                    data: response.status === 204 ? {} : await response.json(),
                    errors: null,
                };
            } else {
                const data = await response.json();

                // Usually API will send an errors object, we need to get the first error message
                const error = data.errors
                    ? Object.values(data.errors as Record<string, string>)[0]
                    : data.message || "An error occurred";

                return {
                    data: null,
                    errors: {
                        message: error,
                        status: response.status,
                    },
                };
            }
        } catch (error) {
            console.error("Error in sendRequest:", error);
            return {
                data: null,
                errors: {
                    message: "An error occurred",
                    status: 500,
                },
            };
        }
    }

    async function sendRequestHelper(
        url: string,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        body?: Record<string, any>,
        params: Record<string, any> = {}
    ) {
        const { data, errors } = await sendRequest({
            query: url,
            params,
            method,
            body,
        });

        if (errors) throw new Error(errors.message);
        return data;
    }

    // Define API functions globally
    const api: RequestFunctions = {
        sendMessage: async ({
            channelId,
            message,
            senderShouldReceive = false,
        }: {
            channelId: number;
            message: { content: string; attachments?: Attachment[] };
            senderShouldReceive?: boolean;
        }) => {
            return sendRequestHelper(
                `/channels/${channelId}/messages`,
                "POST",
                { message },
                {
                    senderShouldReceive,
                }
            );
        },
        updateMessage: async ({
            channelId,
            messageId,
            message,
        }: {
            channelId: number;
            messageId: number;
            message: { content: string; attachments?: Attachment[] };
        }) => {
            return sendRequestHelper(`/channels/${channelId}/messages/${messageId}`, "PUT", {
                ...message,
            });
        },
        pinMessage: async ({ channelId, messageId }: { channelId: number; messageId: number }) => {
            return sendRequestHelper(`/channels/${channelId}/messages/${messageId}/pin`, "PUT");
        },
        unpinMessage: async ({
            channelId,
            messageId,
        }: {
            channelId: number;
            messageId: number;
        }) => {
            return sendRequestHelper(`/channels/${channelId}/messages/${messageId}/pin`, "DELETE");
        },
        deleteMessage: async ({
            channelId,
            messageId,
        }: {
            channelId: number;
            messageId: number;
        }) => {
            return sendRequestHelper(`/channels/${channelId}/messages/${messageId}`, "DELETE");
        },
        addFriend: async ({ username }: { username: string }) => {
            return sendRequestHelper("/users/@me/relationships", "POST", { username });
        },
        removeFriend: async ({ username }: { username: string }) => {
            return sendRequestHelper("/users/@me/relationships", "DELETE", { username });
        },
        blockUser: async ({ userId }: { userId: number }) => {
            return sendRequestHelper(`/users/@me/block/${userId}`, "POST");
        },
        unblockUser: async ({ userId }: { userId: number }) => {
            return sendRequestHelper(`/users/@me/block/${userId}`, "DELETE");
        },
        updateUser: async (body: Record<string, any>) => {
            return sendRequestHelper("/users/@me", "PATCH", body);
        },
        verifyPassword: async ({ password }: { password: string }) => {
            return sendRequestHelper("/auth/verify-password", "POST", { password });
        },
        createChannel: async ({
            recipients,
            skipWarning,
        }: {
            recipients: number[];
            skipWarning?: boolean;
        }) => {
            const sameChannel = channels.find((channel) => {
                return (
                    channel.recipients.length === recipients.length + 1 &&
                    channel.recipients.every((r) => [user.id, ...recipients].includes(r.id))
                );
            });

            if (sameChannel?.type === 0) {
                router.push(`/channels/me/${sameChannel.id}`);
                return {};
            } else if (sameChannel?.type === 1 && !skipWarning) {
                triggerDialog({
                    type: "CHANNEL_EXISTS",
                    data: { channel: sameChannel, recipients: recipients },
                });
                return {};
            }

            return sendRequestHelper("/users/@me/channels", "POST", { recipients });
        },
        updateChannel: async ({
            channelId,
            body,
        }: {
            channelId: number;
            body: Record<string, any>;
        }) => {
            return sendRequestHelper(`/channels/${channelId}`, "PATCH", body);
        },
        deleteChannel: async ({
            channelId,
            noNotify,
        }: {
            channelId: number;
            noNotify?: boolean;
        }) => {
            return sendRequestHelper(
                `/users/@me/channels/${channelId}`,
                "DELETE",
                {},
                { noNotify }
            );
        },
        addChannelRecipients: async ({
            channelId,
            recipients,
            skipWarning,
        }: {
            channelId: number;
            recipients: number[];
            skipWarning?: boolean;
        }) => {
            const channel = channels.find((c) => c.id === channelId);
            if (!channel) return { error: "Channel not found" };
            const newRecipients = [...channel.recipients.map((r) => r.id), ...recipients];

            const sameChannel = channels.find((c) => {
                return (
                    c.type === 1 &&
                    c.recipients.length === newRecipients.length &&
                    c.recipients.every((r) => newRecipients.includes(r.id))
                );
            });

            if (sameChannel && !skipWarning) {
                triggerDialog({
                    type: "CHANNEL_EXISTS",
                    data: { channel: sameChannel, recipients, isAdd: true },
                });
                return {};
            }

            recipients.forEach((id) => {
                sendRequestHelper(`/channels/${channelId}/recipients/${id}`, "PUT");
            });
        },
        removeChannelRecipient: async ({
            channelId,
            recipientId,
        }: {
            channelId: number;
            recipientId: number;
        }) => {
            return sendRequestHelper(`/channels/${channelId}/recipients/${recipientId}`, "DELETE");
        },
        changeOwner: async ({
            channelId,
            recipientId,
        }: {
            channelId: number;
            recipientId: number;
        }) => {
            return sendRequestHelper(
                `/channels/${channelId}/recipients/${recipientId}/owner`,
                "PUT"
            );
        },
        createGuild: async ({ name, icon }: { name: string; icon: string }) => {
            return sendRequestHelper("/guilds", "POST", { name, icon });
        },
        deleteGuild: async ({ guildId }: { guildId: number }) => {
            return sendRequestHelper(`/guilds/${guildId}`, "DELETE");
        },
        createGuildChannel: async ({
            guildId,
            body,
        }: {
            guildId: number;
            body: Record<string, any>;
        }) => {
            return sendRequestHelper(`/guilds/${guildId}/channels`, "POST", body);
        },
        updateGuildChannel: async ({
            channelId,
            body,
        }: {
            channelId: number;
            body: Record<string, any>;
        }) => {
            return sendRequestHelper(`/channels/${channelId}`, "PUT", body);
        },
        deleteGuildChannel: async ({ channelId }: { channelId: number }) => {
            return sendRequestHelper(`/channels/${channelId}`, "DELETE");
        },
        setNote: async ({ userId, note }: { userId: number; note: string }) => {
            return sendRequestHelper(`/users/@me/notes/${userId}`, "PUT", { note });
        },
        getInvites: async ({ codes }: { codes: string[] }) => {
            return sendRequestHelper("/invites", "POST", { codes });
        },
        createInvite: async ({
            channelId,
            body,
        }: {
            channelId: number;
            body: Record<string, any>;
        }) => {
            return sendRequestHelper(`/channels/${channelId}/invites`, "POST", body);
        },
        acceptInvite: async ({ inviteId, isGuild }: { inviteId: number; isGuild: boolean }) => {
            return sendRequestHelper(`/invites/${inviteId}`, "POST", { isGuild });
        },
        deleteInvite: async ({ inviteId }: { inviteId: number }) => {
            return sendRequestHelper(`/invites/${inviteId}`, "DELETE");
        },
        getEmailVerificationCode: async () => {
            return sendRequestHelper("/users/@me/email", "PUT");
        },
        verifyEmailCode: async ({ code }: { code: string }) => {
            return sendRequestHelper("/users/@me/email/verify", "POST", { code });
        },
        addReaction: async ({
            channelId,
            messageId,
            emoji,
        }: {
            channelId: number;
            messageId: number;
            emoji: string;
        }) => {
            return sendRequestHelper(
                `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`,
                "PUT"
            );
        },
        removeReaction: async ({
            channelId,
            messageId,
            emoji,
        }: {
            channelId: number;
            messageId: number;
            emoji: string;
        }) => {
            return sendRequestHelper(
                `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`,
                "DELETE"
            );
        },
        authorizeVoice: async ({ channelId }: { channelId: number }) => {
            return sendRequestHelper(`/auth/voice/${channelId}`, "POST");
        },
        getGuildChannels: async ({ guildId }: { guildId: number }) => {
            return sendRequestHelper(`/guilds/${guildId}/channels`, "GET");
        },
    };

    // State to manage loading, errors, and response data
    const [state, setState] = useState<{ [K in keyof typeof api]?: RequestState<any> }>({});

    // Wrap each function to manage state
    const wrappedRequests = Object.keys(api).reduce((acc, key) => {
        const requestFn = api[key as keyof typeof api];

        acc[key as keyof typeof api] = {
            send: async (
                args: any,
                options?: { onComplete?: (data: any) => void; onFail?: (error: string) => void }
            ) => {
                if (state[key]?.isLoading) return; // Prevent duplicate requests

                // @ts-ignore - This is fine
                setState((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], isLoading: true, error: null },
                }));

                try {
                    const response = await requestFn(args);
                    setState((prev) => ({
                        ...prev,
                        [key]: {
                            isLoading: false,
                            error: null,
                            data: response,
                            send: prev[key]?.send!,
                            clearError: prev[key]?.clearError!,
                        },
                    }));

                    if (options?.onComplete) options.onComplete(response); // Run onComplete callback

                    return response;
                } catch (err) {
                    const errorMessage = (err as Error).message;

                    setState((prev) => ({
                        ...prev,
                        [key]: {
                            isLoading: false,
                            error: errorMessage,
                            data: null,
                            send: prev[key]?.send!,
                            clearError: prev[key]?.clearError!,
                        },
                    }));

                    if (options?.onFail) options.onFail(errorMessage); // Run onFail callback

                    return triggerAlert(
                        "error",
                        errorMessage ?? "An error occurred. Please try again later."
                    );
                }
            },

            isLoading: state[key]?.isLoading || false,
            error: state[key]?.error || null,
            data: state[key]?.data || null,

            clearError: () => {
                // @ts-ignore - This is fine
                setState((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], error: null },
                }));
            },
        };

        return acc;
    }, {} as { [K in keyof typeof api]: RequestState<any> });

    return wrappedRequests;
}
