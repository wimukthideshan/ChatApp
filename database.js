// const mongoose = require('mongoose');

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost/chatapp', { useNewUrlParser: true, useUnifiedTopology: true });

// // Define schemas
// const messageSchema = new mongoose.Schema({
//   content: String,
//   sender: String,
//   recipient: String, // can be a user ID or room name
//   timestamp: { type: Date, default: Date.now }
// });

// const userSchema = new mongoose.Schema({
//   username: String,
//   socketId: String
// });

// // Create models
// const Message = mongoose.model('Message', messageSchema);
// const User = mongoose.model('User', userSchema);

// module.exports = { Message, User };