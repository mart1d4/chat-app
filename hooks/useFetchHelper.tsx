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
    | 'CREATE_CHANNEL'
    | 'UPDATE_CHANNEL'
    | 'LEAVE_CHANNEL'
    | 'DELETE_CHANNEL'
    | 'ADD_CHANNEL_RECIPENTS'
    | 'REMOVE_CHANNEL_RECIPENTS';

type Props = {
    query: TQuery;
    params?: {
        [key: string]: string;
    };
    data?: {
        [key: string]: any;
    };
};

const urls = {
    ['SEND_MESSAGE']: '/users/me/channels/:channelId/messages',
    ['UPDATE_MESSAGE']: '/users/me/channels/:channelId/messages/:messageId',
    ['PIN_MESSAGE']: '/users/me/channels/:channelId/pins/:messageId',
    ['UNPIN_MESSAGE']: '/users/me/channels/:channelId/messages/:messageId/pin',
    ['DELETE_MESSAGE']: '/users/me/channels/:channelId/messages/:messageId',
    ['ADD_FRIEND']: '/users/me/friends/:username',
    ['REMOVE_FRIEND']: '/users/me/friends/:username',
    ['BLOCK_USER']: '/users/:username/block',
    ['UNBLOCK_USER']: '/users/:username/block',
    ['UPDATE_USER']: '/users/me',
    ['CREATE_CHANNEL']: '/users/me/channels',
    ['UPDATE_CHANNEL']: '/users/me/channels/:channelId',
    ['LEAVE_CHANNEL']: '/users/me/channels/:channelId',
    ['DELETE_CHANNEL']: '/users/me/channels/:channelId',
    ['ADD_CHANNEL_RECIPENTS']: '/users/me/channels/:channelId/recipients',
    ['REMOVE_CHANNEL_RECIPENTS']: '/users/me/channels/:channelId/recipients',
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
    ['CREATE_CHANNEL']: 'POST',
    ['UPDATE_CHANNEL']: 'PATCH',
    ['LEAVE_CHANNEL']: 'DELETE',
    ['DELETE_CHANNEL']: 'DELETE',
    ['ADD_CHANNEL_RECIPENTS']: 'PUT',
    ['REMOVE_CHANNEL_RECIPENTS']: 'DELETE',
};

const useFetchHelper = () => {
    const { auth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    const channelExists = (recipients: string[]) => {
        const channel = auth.user.channels.find((channel: TChannel) => {
            return (
                channel.recipients.length === recipients.length &&
                channel.recipientIds.every((recipient: string) => recipients.includes(recipient))
            );
        });

        if (channel) return channel.id;
    };

    const sendRequest = async ({ query, params, data }: Props) => {
        if (!auth?.accessToken) {
            throw new Error('[useFetchHelper] An access token is required');
        }

        if (query === 'CREATE_CHANNEL') {
            const channel = channelExists([...data?.recipients, auth.user.id]);

            if (channel) {
                router.push(`/channels/me/${channel}`);
                return;
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

        url = url.replace(':channelId', params?.channelId ?? '');
        url = url.replace(':messageId', params?.messageId ?? '');
        url = url.replace(':username', params?.username ?? '');

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
