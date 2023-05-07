import axiosPrivate from '@/lib/axios';

export const createChannel = async (recipients: string[]) => {
    const response = await axiosPrivate.post(`/users/me/channels`, {
        recipients: recipients,
    });

    if (!response.data.success) {
        throw new Error('Could not create channel');
    } else {
        return response.data;
    }
};

export const leaveChannel = async (channelId: string) => {
    const response = await axiosPrivate.delete(
        `/users/me/channels/${channelId}`
    );

    if (!response.data.success) {
        throw new Error('Could not leave channel');
    } else {
        return response.data;
    }
};

export const getPinnedMessages = async (channelId: string) => {
    const response = await axiosPrivate.get(
        `/users/me/channels/${channelId}/pins`
    );

    if (!response.data.success) {
        throw new Error('Could not get pinned messages');
    } else {
        return response.data;
    }
};

export const pinMessage = async (channelId: string, messageId: string) => {
    const response = await axiosPrivate.post(
        `/users/me/channels/${channelId}/pins/${messageId}`
    );

    if (!response.data.success) {
        throw new Error('Could not pin message');
    } else {
        return response.data;
    }
};
