const url = process.env.NEXT_PUBLIC_BASE_URL;

export const getUser = async (token: string, userId: string) => {
    const response = await fetch(`${url}/users/${userId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 30 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch user');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response.user;
    }
};

export const blockUser = async (token: string, userId: string) => {
    const response = await fetch(`${url}/users/${userId}/block`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) console.error('Failed to block user');
        return res.json();
    });

    return response;
};

export const unblockUser = async (token: string, userId: string) => {
    const response = await fetch(`${url}/users/${userId}/block`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) console.error('Failed to unblock user');
        return res.json();
    });

    return response;
};

export const addFriend = async (token: string, username: string) => {
    const response = await fetch(`${url}/users/me/friends/${username}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) console.error('Failed to add friend');
        return res.json();
    });

    return response;
};

export const removeFriend = async (token: string, username: string) => {
    const response = await fetch(`${url}/users/me/friends/${username}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) console.error('Failed to remove friend');
        return res.json();
    });

    return response;
};

export const getFriends = async (token: string) => {
    const response = await fetch(`${url}/users/me/friends`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch friends');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response.friends;
    }
};

export const getRequests = async (token: string, type: 'sent' | 'received') => {
    if (type !== 'sent' && type !== 'received') {
        console.error('Invalid request type');
    }

    const response = await fetch(`${url}/users/me/requests/${type}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch requests');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response.requests;
    }
};

export const getBlockedUsers = async (token: string) => {
    const response = await fetch(`${url}/users/me/blocked`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 10 },
    }).then((res) => {
        if (!res.ok) console.error('Failed to fetch blocked users');
        return res.json();
    });

    if (!response.success) {
        return response;
    } else {
        return response.blockedUsers;
    }
};
