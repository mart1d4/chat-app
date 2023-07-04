import Pusher from 'pusher-js';

const pusherConnection: Pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
});

const pusher = pusherConnection.subscribe('chat-app');

export default pusher;
