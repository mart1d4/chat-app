import axiosPrivate from '@/lib/axios';

const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWE1ZjJkZWJiY2VkNzMxZmFhM2M1MyIsImlhdCI6MTY4Mzk3MTY1NiwiZXhwIjoxNjg0NTc2NDU2fQ.QX3iKGQRLwzEEIvcztchjSB9USeyimewaCuBIwF_QiY';

export const getChannels = async () => {
    const response = await axiosPrivate.get(`/users/me/channels`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        throw new Error('Could not create channel');
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
        throw new Error('Could not get channel');
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
        throw new Error('Could not create channel');
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
        throw new Error('Could not leave channel');
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
        throw new Error('Could not get pinned messages');
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
        throw new Error('Could not pin message');
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
        throw new Error('Could not get messages');
    } else {
        return {
            messages: response.data.messages,
            hasMore: response.data.hasMore,
        };
    }
};
