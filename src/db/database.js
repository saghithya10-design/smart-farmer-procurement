 
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDirectory = path.join(__dirname, "../../data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = path.join(dataDirectory, "app.sqlite");

const db = new Database(databasePath);

db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        slot TEXT NOT NULL,
        crop_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        token_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        called_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(date, token_number)
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL
    );
`);

console.log(`SQLite database connected: ${databasePath}`);
console.log("Tables verified: bookings, staff");

module.exports = {
    db,
    databasePath
};