import { useRouter } from "next/navigation";
import { useData } from "@/store";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const queries = {
    GET_MESSAGES: {
        url: "/channels/:channelId/messages",
        method: "GET",
    },
    SEND_MESSAGE: {
        url: "/channels/:channelId/messages",
        method: "POST",
    },
    UPDATE_MESSAGE: {
        url: "/channels/:channelId/messages/:messageId",
        method: "PUT",
    },
    PIN_MESSAGE: {
        url: "/channels/:channelId/messages/:messageId/pin",
        method: "PUT",
    },
    UNPIN_MESSAGE: {
        url: "/channels/:channelId/messages/:messageId/pin",
        method: "DELETE",
    },
    DELETE_MESSAGE: {
        url: "/channels/:channelId/messages/:messageId",
        method: "DELETE",
    },
    ADD_FRIEND: {
        url: "/users/@me/relationships",
        method: "POST",
    },
    REMOVE_FRIEND: {
        url: "/users/@me/relationships",
        method: "DELETE",
    },
    BLOCK_USER: {
        url: "/users/@me/block/:userId",
        method: "POST",
    },
    UNBLOCK_USER: {
        url: "/users/@me/block/:userId",
        method: "DELETE",
    },
    UPDATE_USER: {
        url: "/users/@me",
        method: "PATCH",
    },
    CHANNEL_CREATE: {
        url: "/users/@me/channels",
        method: "POST",
    },
    CHANNEL_UPDATE: {
        url: "/channels/:channelId",
        method: "PATCH",
    },
    CHANNEL_DELETE: {
        url: "/users/@me/channels/:channelId",
        method: "DELETE",
    },
    CHANNEL_RECIPIENT_ADD: {
        url: "/channels/:channelId/recipients/:recipientId",
        method: "PUT",
    },
    CHANNEL_RECIPIENT_REMOVE: {
        url: "/channels/:channelId/recipients/:recipientId",
        method: "DELETE",
    },
    CHANNEL_RECIPIENT_OWNER: {
        url: "/channels/:channelId/recipients/:recipientId/owner",
        method: "PUT",
    },
    CHANNEL_PINNED_MESSAGES: {
        url: "/channels/:channelId/messages/pinned",
        method: "GET",
    },
    GUILD_CREATE: {
        url: "/guilds",
        method: "POST",
    },
    GUILD_DELETE: {
        url: "/guilds/:guildId",
        method: "DELETE",
    },
    GUILD_CHANNEL_CREATE: {
        url: "/guilds/:guildId/channels",
        method: "POST",
    },
    GUILD_CHANNEL_UPDATE: {
        url: "/channels/:channelId",
        method: "PUT",
    },
    GUILD_CHANNEL_DELETE: {
        url: "/channels/:channelId",
        method: "DELETE",
    },
    GET_NOTE: {
        url: "/users/@me/notes/:userId",
        method: "GET",
    },
    SET_NOTE: {
        url: "/users/@me/notes/:userId",
        method: "PUT",
    },
    GET_INVITE: {
        url: "/invites/:inviteId",
        method: "GET",
    },
    CREATE_INVITE: {
        url: "/channels/:channelId/invites",
        method: "POST",
    },
    ACCEPT_INVITE: {
        url: "/invites/:inviteId",
        method: "POST",
    },
    DELETE_INVITE: {
        url: "/invites/:inviteId",
        method: "DELETE",
    },
    GET_USER_PROFILE: {
        url: "/users/:userId/profile",
        method: "GET",
    },
};

type ReturnType = {
    data: any;
    errors: null | {
        [key: string]: any;
    };
};

export default function useRequestHelper() {
    const channels = useData((state) => state.channels);
    const user = useData((state) => state.user);

    const router = useRouter();

    function channelExists(recipients: number[], searchDM: boolean) {
        return channels.find(
            (c) =>
                c.recipients.length === recipients.length &&
                c.recipients.every((r) => recipients.includes(r.id)) &&
                (searchDM ? c.type === 0 : true)
        );
    }

    async function sendRequest({
        query,
        params,
        body,
        attemps = 0,
        skipChannelCheck,
    }: {
        query: keyof typeof queries;
        params?: {
            [key: string]: string | number | boolean;
        };
        body?: {
            [key: string]: any;
        };
        attemps?: number;
        skipChannelCheck?: boolean;
    }): Promise<ReturnType> {
        try {
            if (attemps > 3) {
                localStorage.removeItem("token");
                router.push("/login");

                return {
                    data: null,
                    errors: {
                        message: "Too many attemps",
                        status: 401,
                    },
                };
            }

            // If user wants to create a channel that already exists,
            // prevent it if it's a DM, or ask confirmation if it's a group DM
            if (query === "CHANNEL_CREATE" && body && !skipChannelCheck) {
                if (!user) {
                    router.push("/login");
                    return {
                        data: null,
                        errors: {
                            message: "User not found",
                            status: 401,
                        },
                    };
                }

                const channel = channelExists(
                    [...body.recipients, user.id],
                    body.recipients.length === 1
                );

                if (channel) {
                    if (channel.type === 0) {
                        router.push(`/channels/me/${channel.id}`);
                        return {
                            data: null,
                            errors: {
                                message: "Channel already exists",
                                status: 409,
                            },
                        };
                    } else if (channel.type === 1 && channel.recipients.length !== 1) {
                        // return setLayers({
                        //     settings: {
                        //         type: "POPUP",
                        //     },
                        //     content: {
                        //         type: "CHANNEL_EXISTS",
                        //         channel: channel,
                        //         recipients: channel.recipients,
                        //         addUsers: () => {
                        //             sendRequest({
                        //                 query: "CHANNEL_CREATE",
                        //                 body: body,
                        //                 skipChannelCheck: true,
                        //             });
                        //         },
                        //     },
                        // });
                    }
                }
            }

            const token = localStorage.getItem("token");
            let url = queries[query].url;

            const paramsArr = [
                ":channelId",
                ":messageId",
                ":username",
                ":recipientId",
                ":userId",
                ":guildId",
                ":inviteId",
            ];

            paramsArr.forEach((param) => {
                const sub = param.substring(1);

                if (url.includes(param) && !params?.[sub]) {
                    throw new Error(`[useFetchHelper] A ${param} is required`);
                } else if (url.includes(param)) {
                    url = url.replace(param, params?.[sub]?.toString() ?? "");
                }
            });

            // For all params that aren't part of the paramsArr
            // add them to the url as query params
            if (params) {
                const queryArr = Object.entries(params)
                    .filter(([key]) => !paramsArr.includes(`:${key}`))
                    .map(([key, value]) => `${key}=${value}`);

                if (queryArr.length) {
                    url += `?${queryArr.join("&")}`;
                }
            }

            const response = await fetch(`${apiUrl}${url}`, {
                method: queries[query].method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: queries[query].method !== "GET" ? JSON.stringify(body || {}) : undefined,
            });

            if (
                response.status === 401 &&
                !response.headers.get("Content-Type")?.includes("application/json")
            ) {
                const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
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

                return sendRequest({ query, params, body, attemps: attemps + 1 });
            } else if (response.status === 429) {
                // setLayers({
                //     settings: { type: "POPUP" },
                //     content: { type: "RATE_LIMIT" },
                // });

                const retryAfter = response.headers.get("Retry-After");
                const after = parseInt(retryAfter || "5") * 1000;

                await new Promise((resolve) => setTimeout(resolve, after));
                return sendRequest({ query, params, body, attemps: attemps + 1 });
            } else if (response.ok) {
                const data = await response.json();

                return {
                    data: data || {},
                    errors: {},
                };
            } else {
                const data = await response.json();

                return {
                    data: null,
                    errors: data.errors || {
                        message: data.message,
                        status: response.status,
                    },
                };
            }
        } catch (error: any) {
            return {
                errors: {
                    message: error.message,
                    status: error.status,
                },
                data: null,
            };
        }
    }

    return { sendRequest };
}
