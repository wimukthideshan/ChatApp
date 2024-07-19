const socket = io();

document.getElementById('login-button').addEventListener('click', login);
document.getElementById('username-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        login();
    }
});

function login() {
    const username = document.getElementById('username-input').value.trim();
    if (username) {
        sessionStorage.setItem('username', username);
        window.location.href = '/chat.html';
    } else {
        alert('Please enter a username');
    }
}