import { Server } from 'socket.io';

const socketHandler = (req, res) => {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    const onConnection = (socket) => {
        const createdMessage = (msg) => {
            socket.broadcast.emit('newIncomingMessage', msg);
        };
        
        socket.on('createdMessage', createdMessage);
    };

    io.on('connection', onConnection);
    res.end();
}

export default socketHandler;
