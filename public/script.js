const socket = io();
let selectedUser = null;
let currentUsername = '';
let currentRoom = null;
let chats = {};
let unreadCounts = {};
let users = [];
let rooms = [];

document.addEventListener('DOMContentLoaded', () => {
    currentUsername = sessionStorage.getItem('username');
    if (!currentUsername) {
        window.location.href = '/login.html';
    } else {
        socket.emit('login', currentUsername);
    }

    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});

socket.on('user list', (receivedUsers) => {
    users = receivedUsers;
    updateUserList();
});

socket.on('room list', (roomsWithUnread) => {
    rooms = roomsWithUnread.map(room => room.name);
    roomsWithUnread.forEach(room => {
        unreadCounts[room.name] = room.unreadCount;
    });
    updateRoomList();
});

socket.on('private message', ({ content, from, to }) => {
    if (from === socket.id || to === socket.id) {
        const chatId = from === socket.id ? to : from;
        addMessage(chatId, content, from === socket.id);
        if (selectedUser === chatId) {
            displayChat(chatId);
        } else {
            incrementUnreadCount(chatId);
            const senderUsername = getUsernameById(from);
            showNotification(senderUsername, content, false);
        }
    }
});

socket.on('room messages', ({ room, messages, unreadCount }) => {
    chats[room] = messages;
    displayChat(room);
});

socket.on('room message', ({ room, message }) => {
    if (!chats[room]) {
        chats[room] = [];
    }
    chats[room].push(message);
    if (currentRoom === room) {
        displayChat(room);
    } else {
        incrementUnreadCount(room);
        showNotification(room, message.content, true);
    }
});

socket.on('update room unread', ({ room, unreadCount }) => {
    unreadCounts[room] = unreadCount;
    updateRoomList();
});

function updateUserList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '<h3>Users</h3>' + users.map(user => `
        <div class="user-item ${user.id === selectedUser ? 'selected' : ''}" data-user-id="${user.id}">
            <span class="online-indicator"></span>
            ${user.username} ${user.id === socket.id ? '(yourself)' : ''}
            ${unreadCounts[user.id] ? `<span class="unread-indicator">${unreadCounts[user.id]}</span>` : ''}
        </div>
    `).join('');

    document.querySelectorAll('.user-item').forEach(userItem => {
        userItem.addEventListener('click', () => selectUser(userItem.dataset.userId));
    });
}

function updateRoomList() {
    const roomList = document.querySelector('.room-list');
    roomList.innerHTML = '<h3>Rooms</h3>' + rooms.map(room => `
        <div class="room ${room === currentRoom ? 'selected' : ''}" data-room="${room}">
            ${room}
            ${unreadCounts[room] > 0 ? `<span class="unread-indicator">${unreadCounts[room]}</span>` : ''}
        </div>
    `).join('');

    document.querySelectorAll('.room').forEach(roomElement => {
        roomElement.addEventListener('click', () => joinRoom(roomElement.dataset.room));
    });
}

function selectUser(userId) {
    if (currentRoom) {
        socket.emit('leave room', currentRoom);
        currentRoom = null;
    }
    selectedUser = userId;
    currentRoom = null;
    unreadCounts[userId] = 0;
    updateUserList();
    updateRoomList();
    displayChat(userId);
    document.getElementById('chat-title').textContent = `Chat with ${getUsernameById(userId)}`;
}

function joinRoom(room) {
    if (currentRoom === room) {
        return; // If already in the room, do nothing
    }
    
    if (currentRoom) {
        socket.emit('leave room', currentRoom);
    }
    selectedUser = null;
    currentRoom = room;
    
    // Clear unread count immediately
    unreadCounts[room] = 0;
    updateRoomList();
    
    socket.emit('join room', room);
    socket.emit('mark room as read', room);
    
    updateUserList();
    document.getElementById('chat-title').textContent = room;
}

function displayChat(id) {
    const messages = document.getElementById('messages');
    messages.innerHTML = '';
    if (chats[id]) {
        chats[id].forEach(msg => {
            const messageElement = createMessageElement(msg.content, msg.senderId === socket.id, msg.username);
            messages.appendChild(messageElement);
        });
    }
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    if (message) {
        if (selectedUser && selectedUser !== socket.id) {
            socket.emit('private message', { content: message, to: selectedUser });
            addMessage(selectedUser, message, true);
            displayChat(selectedUser);
        } else if (currentRoom) {
            socket.emit('room message', { room: currentRoom, content: message });
        } else {
            alert("Please select a user or join a room to send a message.");
            return;
        }
        messageInput.value = '';
    }
}

function addMessage(id, content, isSent, username = null) {
    if (!chats[id]) {
        chats[id] = [];
    }
    chats[id].push({ content, senderId: isSent ? socket.id : id, username });
}

function createMessageElement(content, isSent, username = null) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    messageElement.innerHTML = `
        <div class="message-bubble">
            ${username && !isSent ? `<div class="message-username">${username}</div>` : ''}
            <div class="message-content">${content}</div>
        </div>
    `;
    return messageElement;
}

function incrementUnreadCount(id) {
    if (!unreadCounts[id]) {
        unreadCounts[id] = 0;
    }
    unreadCounts[id]++;
    updateUserList();
    updateRoomList();
}

function getUsernameById(userId) {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
}

function selectUserOrRoom(id, isRoom) {
    if (isRoom) {
        joinRoom(id);
    } else {
        const user = users.find(u => u.username === id);
        if (user) {
            selectUser(user.id);
        }
    }
}