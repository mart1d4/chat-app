import axiosPrivate from '@/lib/axios';

export const getUser = async (userId: string) => {
    const response = await axiosPrivate.get(`/users/${userId}`);

    if (!response.data.success) {
        throw new Error('Could not get user');
    } else {
        return response.data;
    }
};

export const blockUser = async (userId: string) => {
    const response = await axiosPrivate.post(`/users/${userId}/block`);

    if (!response.data.success) {
        throw new Error('Could not block user');
    } else {
        return response.data;
    }
};

export const unblockUser = async (userId: string) => {
    const response = await axiosPrivate.delete(`/users/${userId}/block`);

    if (!response.data.success) {
        throw new Error('Could not unblock user');
    } else {
        return response.data;
    }
};

export const addFriend = async (userId: string) => {
    const response = await axiosPrivate.post(`/users/me/friends/${userId}`);

    if (!response.data.success) {
        throw new Error('Could not add friend');
    } else {
        return response.data;
    }
};

export const removeFriend = async (userId: string) => {
    const response = await axiosPrivate.delete(`/users/me/friends/${userId}`);

    if (!response.data.success) {
        throw new Error('Could not remove friend');
    } else {
        return response.data;
    }
};

export const getFriends = async () => {
    const response = await axiosPrivate.get(`/users/me/friends`);

    if (!response.data.success) {
        throw new Error('Could not get friends');
    } else {
        return response.data;
    }
};

export const getRequests = async (type: 'sent' | 'received') => {
    if (type !== 'sent' && type !== 'received') {
        throw new Error('Invalid request type');
    }

    const response = await axiosPrivate.get(`/users/me/requests/${type}`);

    if (!response.data.success) {
        throw new Error('Could not get requests');
    } else {
        return response.data;
    }
};

export const getBlockedUsers = async () => {
    const response = await axiosPrivate.get(`/users/me/blocked`);

    if (!response.data.success) {
        throw new Error('Could not get blocked users');
    } else {
        return response.data;
    }
};
