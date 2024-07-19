# Real-Time Chat Application

This is a real-time chat application built with Node.js, Express, Socket.IO, and SQLite.

## Live Demo

You can try out the live demo of this application here: [https://chatapp-sswe.onrender.com](https://chatapp-sswe.onrender.com)

## Features

- Real-time messaging
- Private messaging between users
- Chat rooms
- Message history stored in SQLite database
- Notifications for new messages

## Setup Instructions

1. Clone the repository:
- Open your terminal or command prompt.
   - Navigate to the directory where you want to store the project.
   - Run the following command to clone the repository:
     ```
     git clone https://github.com/wimukthideshan/ChatApp.git
     ```
   - Once cloning is complete, navigate into the project directory:
     ```
     cd ChatApp
     ```
2. Install dependencies:
- Ensure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).
   - In the project directory, run the following command to install all necessary dependencies:
     ```
     npm install 
     ```
   - This will install Express, Socket.IO, SQLite, and any other dependencies specified in the package.json file.

3. Start the server:
- After the installation is complete, you can start the server by running:
     ```
     npm start
     ```
   - If successful, you should see a message indicating that the server is running and listening on a specific port (default is 8080).
   - Keep this terminal window open while using the application.
     
4. Open your browser and navigate to `http://localhost:8080`
 - Open your web browser and navigate to:
     ```
     http://localhost:8080
     ```
   - You should now see the login page of the chat application.
  
Note: If you encounter any issues during these steps, ensure that:
- You have the latest version of Node.js and npm installed.
- Your firewall or antivirus is not blocking the application.
- The port 8080 (or whichever port the app is using) is not being used by another application.

## Application Structure

- `index.js`: Main server file, sets up Express and Socket.IO
- `database.js`: SQLite database configuration
- `public/`: Directory for static files
- `index.html`: Main chat interface
- `login.html`: Login page
- `styles.css`: CSS styles
- `script.js`: Client-side JavaScript
- `notification.js`: Handles notifications

## How It Works

1. Users log in with a username
2. Users can join rooms or start private chats
3. Messages are sent and received in real-time using Socket.IO
4. All messages are stored in an SQLite database for persistence

## Assumptions and Limitations

- User authentication is basic (username only) and not secure for production use
- SQLite is used for simplicity, but may not be suitable for large-scale deployments
- The application assumes a reliable internet connection for real-time features
- There's no message encryption implemented

## Technologies Used

- Node.js
- Express.js
- Socket.IO
- SQLite
- HTML/CSS/JavaScript

## Future Improvements

- Implement secure user authentication
- Add message encryption
- Improve UI/UX design
- Implement file sharing functionality
- Add user profiles and avatars

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check (https://github.com/your-username/chat-app) if you want to contribute.
