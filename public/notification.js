let isMuted = false;
let activeNotification = null;

function showNotification(sender, message, isRoom = false) {
    if (isMuted) return;

    // Dismiss any existing notification
    dismissNotification();

    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    
    const notificationContent = `
        <div class="notification">
            <p>You have a new message from ${sender}!</p>
            <div class="notification-buttons">
                <button onclick="dismissNotification()">Dismiss</button>
                <button onclick="viewMessage('${sender}', '${message}', ${isRoom})">View</button>
            </div>
        </div>
    `;
    
    notificationContainer.innerHTML = notificationContent;
    document.body.appendChild(notificationContainer);
    
    // Add blur effect to the main content
    document.querySelector('.chat-container').classList.add('blur');

    // Store the active notification
    activeNotification = notificationContainer;
}

function dismissNotification() {
    if (activeNotification) {
        activeNotification.remove();
        document.querySelector('.chat-container').classList.remove('blur');
        activeNotification = null;
    }
}

function viewMessage(sender, message, isRoom) {
    dismissNotification();
    if (typeof selectUserOrRoom === 'function') {
        selectUserOrRoom(sender, isRoom);
        // Wait for the chat to load, then scroll to the bottom
        setTimeout(() => {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const muteButton = document.getElementById('mute-button');
    muteButton.innerHTML = isMuted ? '🔕' : '🔔';
}

// Initialize mute button state
document.addEventListener('DOMContentLoaded', () => {
    const muteButton = document.getElementById('mute-button');
    muteButton.innerHTML = isMuted ? '🔕' : '🔔';
});