// const sqlite3 = require("sqlite3").verbose();
// const db = new sqlite3.Database("finance.db");

// db.serialize(() => {
//   db.run(`
//             CREATE TABLE categories (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
//   );
//         `);

//   db.run(`
//             CREATE TABLE transactions (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
//     category TEXT NOT NULL,
//     amount DECIMAL(10, 2) NOT NULL,
//     date DATE NOT NULL,
//     description TEXT
//   );
//         `);
// });
// module.exports = db;
