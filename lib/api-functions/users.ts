import axiosPrivate from '@/lib/axios';

const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NWE1ZjJkZWJiY2VkNzMxZmFhM2M1MyIsImlhdCI6MTY4Mzk3MTY1NiwiZXhwIjoxNjg0NTc2NDU2fQ.QX3iKGQRLwzEEIvcztchjSB9USeyimewaCuBIwF_QiY';

export const getUser = async (userId: string) => {
    const response = await axiosPrivate.get(`/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data.user;
    }
};

export const blockUser = async (userId: string) => {
    const response = await axiosPrivate.post(
        `/users/${userId}/block`,
        {},
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

export const unblockUser = async (userId: string) => {
    const response = await axiosPrivate.delete(`/users/${userId}/block`, {
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

export const addFriend = async (userId: string) => {
    const response = await axiosPrivate.post(
        `/users/me/friends/${userId}`,
        {},
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

export const removeFriend = async (userId: string) => {
    const response = await axiosPrivate.delete(`/users/me/friends/${userId}`, {
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

export const getFriends = async () => {
    const response = await axiosPrivate.get(`/users/me/friends`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data.friends;
    }
};

export const getRequests = async (type: 'sent' | 'received') => {
    if (type !== 'sent' && type !== 'received') {
        throw new Error('Invalid request type');
    }

    const response = await axiosPrivate.get(`/users/me/requests/${type}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data.requests;
    }
};

export const getBlockedUsers = async () => {
    const response = await axiosPrivate.get(`/users/me/blocked`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });

    if (!response.data.success) {
        return response.data;
    } else {
        return response.data.blockedUsers;
    }
};
