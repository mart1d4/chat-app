const url = process.env.NEXT_PUBLIC_BASE_URL;

export const getChannels = async (token: string) => {
    const response = await fetch(`${url}/users/me/channels`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch channels');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response.channels;
    }
};

export const getSingleChannel = async (token: string, channelId: string) => {
    const response = await fetch(`${url}/users/me/channels/${channelId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 30 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch channel');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response.channel;
    }
};

export const createChannel = async (token: string, recipients: string[], channelId?: string) => {
    const response = await fetch(`${url}/users/me/channels`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipients,
            channelId,
        }),
    }).then((res) => {
        if (!res.ok) console.error('Failed to create channel');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response;
    }
};

export const leaveChannel = async (token: string, channelId: string) => {
    const response = await fetch(`${url}/users/me/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) console.error('Failed to leave channel');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response;
    }
};

export const getPinnedMessages = async (token: string, channelId: string) => {
    const response = await fetch(`${url}/users/me/channels/${channelId}/pins`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch pinned messages');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response;
    }
};

export const pinMessage = async (token: string, channelId: string, messageId: string) => {
    const response = await fetch(`${url}/users/me/channels/${channelId}/pins/${messageId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) console.error('Failed to pin message');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response;
    }
};

export const getMessages = async (
    token: string,
    channelId: string,
    skip?: number,
    limit?: number
) => {
    const response = await fetch(`${url}/users/me/channels/${channelId}/messages`, {
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
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch messages');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return {
            messages: response.messages,
            hasMore: response.hasMore,
        };
    }
};
