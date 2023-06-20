const url = process.env.NEXT_PUBLIC_BASE_URL;

export const pinMessage = async (token: string, message: MessageType) => {
    const response = await fetch(
        `${url}/users/me/channels/${message.channelId[0]}/messages/${message.id}/pin`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response;
};

export const unpinMessage = async (token: string, message: MessageType) => {
    const response = await fetch(
        `${url}/users/me/channels/${message.channelId[0]}/messages/${message.id}/pin`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response;
};

export const deleteMessage = async (token: string, message: MessageType) => {
    const response = await fetch(
        `${url}/users/me/channels/${message.channelId[0]}/messages/${message.id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response;
};

export const editMessage = async (token: string, message: MessageType, content: string) => {
    const response = await fetch(
        `${url}/users/me/channels/${message.channelId[0]}/messages/${message.id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        }
    );

    return response;
};
