import Pusher from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!pusherKey || !pusherCluster) {
    throw new Error("Pusher key or cluster not found.");
}

const pusherConnection: Pusher = new Pusher(pusherKey, {
    cluster: pusherCluster,
});

const pusher = pusherConnection.subscribe("app");
export default pusher;
