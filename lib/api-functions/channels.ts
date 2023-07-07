const url = process.env.NEXT_PUBLIC_BASE_URL;

export const getChannels = async (token: string) => {
    return await fetch(`${url}/users/me/channels`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => res.json());
};

export const getSingleChannel = async (token: string, channelId: string) => {
    return await fetch(`${url}/users/me/channels/${channelId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 30 },
    }).then((res) => res.json());
};

export const createChannel = async (token: string, recipients: string[], channelId?: string) => {
    return await fetch(`${url}/users/me/channels`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipients,
            channelId,
        }),
    }).then((res) => res.json());
};

export const leaveChannel = async (token: string, channelId: string) => {
    return await fetch(`${url}/users/me/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => res.json());
};

export const getPinnedMessages = async (token: string, channelId: string) => {
    return await fetch(`${url}/users/me/channels/${channelId}/pins`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => res.json());
};

export const pinMessage = async (token: string, channelId: string, messageId: string) => {
    return await fetch(`${url}/users/me/channels/${channelId}/pins/${messageId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => res.json());
};

export const getMessages = async (token: string, channelId: string, skip?: number, limit?: number) => {
    return await fetch(`${url}/users/me/channels/${channelId}/messages`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            skip: skip || 0,
            limit: limit || 50,
        }),
        next: { revalidate: 120 },
    }).then((res) => res.json());
};
