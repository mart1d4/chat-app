import axiosPrivate from '@/lib/axios';

const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWE1ZjJkZWJiY2VkNzMxZmFhM2M1MyIsImlhdCI6MTY4MzkwMDI2MSwiZXhwIjoxNjg0NTA1MDYxfQ.-qGUmwSAN5zwriTl6P-KR30sHSL_-JPpW1g7JT9LSE8';

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

export const createChannel = async (
    recipients: string[],
    channelId: string
) => {
    const response = await axiosPrivate.post(
        `/users/me/channels`,
        {
            recipients: recipients,
            channelId: channelId || null,
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
    const response = await axiosPrivate.delete(
        `/users/me/channels/${channelId}`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        }
    );

    if (!response.data.success) {
        throw new Error('Could not leave channel');
    } else {
        return response.data;
    }
};

export const getPinnedMessages = async (channelId: string) => {
    const response = await axiosPrivate.get(
        `/users/me/channels/${channelId}/pins`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        }
    );

    if (!response.data.success) {
        throw new Error('Could not get pinned messages');
    } else {
        return response.data;
    }
};

export const pinMessage = async (channelId: string, messageId: string) => {
    const response = await axiosPrivate.post(
        `/users/me/channels/${channelId}/pins/${messageId}`,
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        }
    );

    if (!response.data.success) {
        throw new Error('Could not pin message');
    } else {
        return response.data;
    }
};
