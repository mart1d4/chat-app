import useContextHook from './useContextHook';
import { useRouter } from 'next/navigation';

type TQuery =
    | 'SEND_MESSAGE'
    | 'UPDATE_MESSAGE'
    | 'PIN_MESSAGE'
    | 'UNPIN_MESSAGE'
    | 'DELETE_MESSAGE'
    | 'ADD_FRIEND'
    | 'REMOVE_FRIEND'
    | 'BLOCK_USER'
    | 'UNBLOCK_USER'
    | 'UPDATE_USER'
    | 'CHANNEL_CREATE'
    | 'CHANNEL_UPDATE'
    | 'CHANNEL_DELETE'
    | 'CHANNEL_RECIPIENT_ADD'
    | 'CHANNEL_RECIPIENT_REMOVE';

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
    ['SEND_MESSAGE']: '/channels/:channelId/messages',
    ['UPDATE_MESSAGE']: '/channels/:channelId/messages/:messageId',
    ['PIN_MESSAGE']: '/channels/:channelId/messages/:messageId/pin',
    ['UNPIN_MESSAGE']: '/channels/:channelId/messages/:messageId/pin',
    ['DELETE_MESSAGE']: '/channels/:channelId/messages/:messageId',
    ['ADD_FRIEND']: '/users/me/friends/:username',
    ['REMOVE_FRIEND']: '/users/me/friends/:username',
    ['BLOCK_USER']: '/users/:username/block',
    ['UNBLOCK_USER']: '/users/:username/block',
    ['UPDATE_USER']: '/users/me',
    ['CHANNEL_CREATE']: '/users/me/channels',
    ['CHANNEL_UPDATE']: '/users/me/channels/:channelId',
    ['CHANNEL_DELETE']: '/users/me/channels/:channelId',
    ['CHANNEL_RECIPIENT_ADD']: '/channels/:channelId/recipients/:recipientId',
    ['CHANNEL_RECIPIENT_REMOVE']: '/channels/:channelId/recipients/:recipientId',
};

const methods = {
    ['SEND_MESSAGE']: 'POST',
    ['UPDATE_MESSAGE']: 'PUT',
    ['PIN_MESSAGE']: 'POST',
    ['UNPIN_MESSAGE']: 'DELETE',
    ['DELETE_MESSAGE']: 'DELETE',
    ['ADD_FRIEND']: 'POST',
    ['REMOVE_FRIEND']: 'DELETE',
    ['BLOCK_USER']: 'POST',
    ['UNBLOCK_USER']: 'DELETE',
    ['UPDATE_USER']: 'PATCH',
    ['CHANNEL_CREATE']: 'POST',
    ['CHANNEL_UPDATE']: 'PUT',
    ['CHANNEL_DELETE']: 'DELETE',
    ['CHANNEL_RECIPIENT_ADD']: 'PUT',
    ['CHANNEL_RECIPIENT_REMOVE']: 'DELETE',
};

const useFetchHelper = () => {
    const { setPopup }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    const channelExists = (recipients: string[]) => {
        const channel = auth.user.channels.find((channel: TChannel) => {
            return (
                channel.recipients.length === recipients.length &&
                channel.recipientIds.every((recipient: string) => recipients.includes(recipient))
            );
        });

        if (channel) return channel;
    };

    const sendRequest = async ({ query, params, data, skipCheck }: Props) => {
        if (!auth?.accessToken) {
            throw new Error('[useFetchHelper] An access token is required');
        }

        if (query === 'CHANNEL_CREATE' && (typeof skipCheck === 'undefined' || !skipCheck)) {
            const channel = channelExists([...data?.recipients, auth.user.id]);

            console.log(channel);

            if (channel) {
                if (channel.type === 'DM') {
                    router.push(`/channels/me/${channel.id}`);
                    return;
                } else if (channel.type === 'GROUP_DM' && channel.recipients.length !== 1) {
                    setPopup({
                        type: 'CHANNEL_EXISTS',
                        channel: channel,
                    });
                    return;
                }
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
        };

        const body = JSON.stringify(data ?? {});

        let url: string = urls[query];
        let method: string = methods[query];

        if (url.includes(':channelId') && !params?.channelId) {
            throw new Error('[useFetchHelper] A channelId is required');
        }

        if (url.includes(':messageId') && !params?.messageId) {
            throw new Error('[useFetchHelper] A messageId is required');
        }

        if (url.includes(':username') && !params?.username) {
            throw new Error('[useFetchHelper] A username is required');
        }

        if (url.includes(':recipientId') && !params?.recipientId) {
            throw new Error('[useFetchHelper] A recipientId is required');
        }

        url = url.replace(':channelId', params?.channelId ?? '');
        url = url.replace(':messageId', params?.messageId ?? '');
        url = url.replace(':username', params?.username ?? '');
        url = url.replace(':recipientId', params?.recipientId ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
                method: method,
                headers,
                body,
            }).then((res) => res.json());

            return response;
        } catch (error) {
            console.error(error);
            throw new Error('[useFetchHelper] Error sending request');
        }
    };

    return { sendRequest };
};

export default useFetchHelper;
