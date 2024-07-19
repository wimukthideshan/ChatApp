const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

let users = [];
const rooms = ['Room 1', 'Room 2'];
const roomMessages = {
    'Room 1': [],
    'Room 2': []
};
const userRoomLastRead = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('login', (username) => {
        console.log('User logged in:', username);
        users.push({ id: socket.id, username });
        socket.username = username;
        userRoomLastRead[socket.id] = { 'Room 1': 0, 'Room 2': 0 };
        io.emit('user list', users);
        
        // Send room list with unread counts
        const roomsWithUnread = rooms.map(room => ({
            name: room,
            unreadCount: roomMessages[room].length - userRoomLastRead[socket.id][room]
        }));
        socket.emit('room list', roomsWithUnread);
    });

    socket.on('private message', ({ content, to }) => {
        console.log('Private message:', content, 'from:', socket.username, 'to:', to);
        socket.to(to).emit('private message', {
            content,
            from: socket.id,
            to: to
        });
    });

    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`${socket.username} joined ${room}`);
        const unreadCount = roomMessages[room].length - userRoomLastRead[socket.id][room];
        socket.emit('room messages', { room, messages: roomMessages[room], unreadCount });
    });

    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`${socket.username} left ${room}`);
    });

    socket.on('room message', ({ room, content }) => {
        console.log('Room message:', content, 'in', room, 'from:', socket.username);
        const message = { username: socket.username, content, senderId: socket.id };
        roomMessages[room].push(message);
        
        // Emit the message to all users in the room
        io.to(room).emit('room message', { room, message });
        
        // Update unread counts for users not in the room
        users.forEach(user => {
            if (user.id !== socket.id && (!io.sockets.adapter.rooms.get(room) || !io.sockets.adapter.rooms.get(room).has(user.id))) {
                const unreadCount = roomMessages[room].length - (userRoomLastRead[user.id]?.[room] || 0);
                io.to(user.id).emit('update room unread', { room, unreadCount });
            }
        });
    });

    socket.on('mark room as read', (room) => {
        userRoomLastRead[socket.id][room] = roomMessages[room].length;
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        users = users.filter(user => user.id !== socket.id);
        delete userRoomLastRead[socket.id];
        io.emit('user list', users);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});