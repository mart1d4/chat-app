import useContextHook from "./useContextHook";
import { useRouter } from "next/navigation";
import { useData, useLayers } from "@/lib/store";

type TQuery =
    | "SEND_MESSAGE"
    | "UPDATE_MESSAGE"
    | "PIN_MESSAGE"
    | "UNPIN_MESSAGE"
    | "DELETE_MESSAGE"
    | "ADD_FRIEND"
    | "REMOVE_FRIEND"
    | "BLOCK_USER"
    | "UNBLOCK_USER"
    | "UPDATE_USER"
    | "CHANNEL_CREATE"
    | "CHANNEL_UPDATE"
    | "CHANNEL_DELETE"
    | "CHANNEL_RECIPIENT_ADD"
    | "CHANNEL_RECIPIENT_REMOVE"
    | "CHANNEL_RECIPIENT_OWNER"
    | "CHANNEL_PINNED_MESSAGES"
    | "GUILD_CREATE"
    | "GUILD_DELETE"
    | "GUILD_CHANNEL_CREATE"
    | "GUILD_CHANNEL_UPDATE"
    | "GUILD_CHANNEL_DELETE";

type Props = {
    query: TQuery;
    params?: {
        [key: string]: string;
    };
    data?: {
        [key: string]: any;
    };
    skipCheck?: boolean;
};

const urls = {
    ["SEND_MESSAGE"]: "/channels/:channelId/messages",
    ["UPDATE_MESSAGE"]: "/channels/:channelId/messages/:messageId",
    ["PIN_MESSAGE"]: "/channels/:channelId/messages/:messageId/pin",
    ["UNPIN_MESSAGE"]: "/channels/:channelId/messages/:messageId/pin",
    ["DELETE_MESSAGE"]: "/channels/:channelId/messages/:messageId",
    ["ADD_FRIEND"]: "/users/me/friends/:username",
    ["REMOVE_FRIEND"]: "/users/me/friends/:username",
    ["BLOCK_USER"]: "/users/:username/block",
    ["UNBLOCK_USER"]: "/users/:username/block",
    ["UPDATE_USER"]: "/users/me",
    ["CHANNEL_CREATE"]: "/users/me/channels",
    ["CHANNEL_UPDATE"]: "/users/me/channels/:channelId",
    ["CHANNEL_DELETE"]: "/users/me/channels/:channelId",
    ["CHANNEL_RECIPIENT_ADD"]: "/channels/:channelId/recipients/:recipientId",
    ["CHANNEL_RECIPIENT_REMOVE"]: "/channels/:channelId/recipients/:recipientId",
    ["CHANNEL_RECIPIENT_OWNER"]: "/channels/:channelId/recipients/:recipientId/owner",
    ["CHANNEL_PINNED_MESSAGES"]: "/channels/:channelId/messages/pinned",
    ["GUILD_CREATE"]: "/guilds",
    ["GUILD_DELETE"]: "/guilds/:guildId",
    ["GUILD_CHANNEL_CREATE"]: "/guilds/:guildId/channels",
    ["GUILD_CHANNEL_UPDATE"]: "/channels/:channelId",
    ["GUILD_CHANNEL_DELETE"]: "/channels/:channelId",
};

const methods = {
    ["SEND_MESSAGE"]: "POST",
    ["UPDATE_MESSAGE"]: "PUT",
    ["PIN_MESSAGE"]: "POST",
    ["UNPIN_MESSAGE"]: "DELETE",
    ["DELETE_MESSAGE"]: "DELETE",
    ["ADD_FRIEND"]: "POST",
    ["REMOVE_FRIEND"]: "DELETE",
    ["BLOCK_USER"]: "POST",
    ["UNBLOCK_USER"]: "DELETE",
    ["UPDATE_USER"]: "PATCH",
    ["CHANNEL_CREATE"]: "POST",
    ["CHANNEL_UPDATE"]: "PUT",
    ["CHANNEL_DELETE"]: "DELETE",
    ["CHANNEL_RECIPIENT_ADD"]: "PUT",
    ["CHANNEL_RECIPIENT_REMOVE"]: "DELETE",
    ["CHANNEL_RECIPIENT_OWNER"]: "PUT",
    ["CHANNEL_PINNED_MESSAGES"]: "GET",
    ["GUILD_CREATE"]: "POST",
    ["GUILD_DELETE"]: "DELETE",
    ["GUILD_CHANNEL_CREATE"]: "POST",
    ["GUILD_CHANNEL_UPDATE"]: "PUT",
    ["GUILD_CHANNEL_DELETE"]: "DELETE",
};

const useFetchHelper = () => {
    const setLayers = useLayers((state) => state.setLayers);
    const setToken = useData((state) => state.setToken);
    const channels = useData((state) => state.channels);
    const token = useData((state) => state.token);
    const user = useData((state) => state.user) as TUser;
    const router = useRouter();

    const channelExists = (recipients: string[], searchDM: boolean) => {
        return channels.find((channel: TChannel) => {
            return (
                channel.recipients.length === recipients.length &&
                channel.recipientIds.every((recipient: string) => recipients.includes(recipient)) &&
                (searchDM ? channel.type === 0 : true)
            );
        });
    };

    const sendRequest = async ({ query, params, data, skipCheck }: Props) => {
        if (query === "CHANNEL_CREATE" && !skipCheck) {
            const channel =
                data?.recipients.length === 1
                    ? channelExists([...data?.recipients, user.id], true)
                    : channelExists([...data?.recipients, user.id], false);
            if (channel) {
                if (channel.type === 0) {
                    return router.push(`/channels/me/${channel.id}`);
                } else if (channel.type === 1 && channel.recipients.length !== 1) {
                    return setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "CHANNEL_EXISTS",
                            channel: channel,
                            recipients: data?.recipients,
                        },
                    });
                }
            }
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        const body = JSON.stringify(data ?? {});

        let url: string = urls[query];
        let method: string = methods[query];

        if (url.includes(":channelId") && !params?.channelId) {
            throw new Error("[useFetchHelper] A channelId is required");
        }

        if (url.includes(":messageId") && !params?.messageId) {
            throw new Error("[useFetchHelper] A messageId is required");
        }

        if (url.includes(":username") && !params?.username) {
            throw new Error("[useFetchHelper] A username is required");
        }

        if (url.includes(":recipientId") && !params?.recipientId) {
            throw new Error("[useFetchHelper] A recipientId is required");
        }

        if (url.includes(":guildId") && !params?.guildId) {
            throw new Error("[useFetchHelper] A guildId is required");
        }

        url = url.replace(":channelId", params?.channelId ?? "");
        url = url.replace(":messageId", params?.messageId ?? "");
        url = url.replace(":username", params?.username ?? "");
        url = url.replace(":recipientId", params?.recipientId ?? "");
        url = url.replace(":guildId", params?.guildId ?? "");

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
            method: method,
            headers: headers,
            body: method !== "GET" ? body : undefined,
        });

        if (response.status === 401) {
            const { sendRequest: resend } = useFetchHelper();

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
                method: "GET",
                credentials: "include",
            }).then((res) => res.json());

            if (!response.token) throw new Error("[useFetchHelper] No token found");
            setToken(response.token);

            const res: any = await resend({ query, params, data, skipCheck });
            return res;
        } else {
            const res = await response.json();

            if (query === "CHANNEL_CREATE" && res.channelId) {
                router.push(`/channels/me/${res.channelId}`);
            } else if (query === "GUILD_CREATE" && res.channelId && res.guildId) {
                router.push(`/channels/${res.guildId}/${res.channelId}`);
            } else if (query === "GUILD_CHANNEL_CREATE" && res.channelId && res.guildId) {
                router.push(`/channels/${res.guildId}/${res.channelId}`);
            } else if ((query === "CHANNEL_DELETE" || query === "CHANNEL_RECIPIENT_REMOVE") && res.channelId) {
                router.refresh();
            }

            return res;
        }
    };

    return { sendRequest };
};

export default useFetchHelper;
