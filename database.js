const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "chat.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE message (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT, 
            receiver TEXT,
            content TEXT, 
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_room_message BOOLEAN
        )`, (err) => {
            if (err) {
                // Table already created
            } else {
                console.log('Message table created.');
            }
        });
    }
});

module.exports = db;