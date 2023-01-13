import { Server } from 'socket.io';

const socketHandler = (req, res) => {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
        socket.on('messageSent', message => {
            socket.broadcast.emit('messageReceived', message)
        })
    })

    res.end();
}

export default socketHandler;
