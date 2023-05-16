import axiosPrivate from '@/lib/axios';

const TOKEN = process.env.TEST_TOKEN;

export const getChannels = async () => {
    const response = await axiosPrivate.get(`/users/me/channels`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data.channels;
    }
};

export const getSingleChannel = async (channelId: string) => {
    const response = await axiosPrivate.get(`/users/me/channels/${channelId}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data.channel;
    }
};

export const createChannel = async (recipients: string[], channelId?: string) => {
    const response = await axiosPrivate.post(
        `/users/me/channels`,
        {
            recipients: recipients,
            channelId: channelId,
        },
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        }
    );

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data;
    }
};

export const leaveChannel = async (channelId: string) => {
    const response = await axiosPrivate.delete(`/users/me/channels/${channelId}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data;
    }
};

export const getPinnedMessages = async (channelId: string) => {
    const response = await axiosPrivate.get(`/users/me/channels/${channelId}/pins`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data;
    }
};

export const pinMessage = async (channelId: string, messageId: string) => {
    const response = await axiosPrivate.post(`/users/me/channels/${channelId}/pins/${messageId}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data;
    }
};

export const getMessages = async (channelId: string, skip?: number, limit?: number) => {
    const response = await axiosPrivate.get(`/users/me/channels/${channelId}/messages`, {
        params: {
            skip: skip || 0,
            limit: limit || 50,
        },
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return {
            messages: response.data.messages,
            hasMore: response.data.hasMore,
        };
    }
};
