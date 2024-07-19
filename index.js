const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const db = require('./database.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

let users = [];
const rooms = ['Room 1', 'Room 2'];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('login', (username) => {
        console.log('User logged in:', username);
        users.push({ id: socket.id, username });
        socket.username = username;
        io.emit('user list', users);
        socket.emit('room list', rooms);
    });

    socket.on('private message', ({ content, to }) => {
        console.log('Private message:', content, 'from:', socket.username, 'to:', to);
        
        // Save message to database
        db.run(`INSERT INTO message (sender, receiver, content, is_room_message) VALUES (?, ?, ?, ?)`, 
            [socket.username, getUsernameById(to), content, false], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

        socket.to(to).emit('private message', {
            content,
            from: socket.id,
            to: to
        });
    });

    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`${socket.username} joined ${room}`);
        socket.emit('room joined', room);
    });

    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`${socket.username} left ${room}`);
    });

    socket.on('room message', ({ room, content }) => {
        console.log('Room message:', content, 'in', room, 'from:', socket.username);
        
        // Save message to database
        db.run(`INSERT INTO message (sender, receiver, content, is_room_message) VALUES (?, ?, ?, ?)`, 
            [socket.username, room, content, true], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

        const message = { username: socket.username, content, senderId: socket.id };
        io.to(room).emit('room message', { room, message });
    });

    socket.on('get chat history', ({ with: chatWith, isRoom }) => {
        let sql = `SELECT * FROM message WHERE 
            (sender = ? AND receiver = ? AND is_room_message = ?) OR 
            (sender = ? AND receiver = ? AND is_room_message = ?)
            ORDER BY timestamp ASC`;
        
        let params = isRoom ? 
            [chatWith, chatWith, true, chatWith, chatWith, true] :
            [socket.username, chatWith, false, chatWith, socket.username, false];

        db.all(sql, params, (err, rows) => {
            if (err) {
                throw err;
            }
            socket.emit('chat history', rows);
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        users = users.filter(user => user.id !== socket.id);
        io.emit('user list', users);
    });
});

function getUsernameById(userId) {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});