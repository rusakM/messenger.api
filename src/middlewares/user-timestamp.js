const mysql = require('mysql');
const { db } = require('./config');

module.exports = (userId) => {
    const connection = mysql.createConnection(db);
    const timeNow = new Date();
    const query = `UPDATE users SET lastSeen="${timeNow.getTime()}" WHERE userId=${userId}`;

    connection.query(query, (err, result, fields) => {
        if (err) throw err;
        connection.destroy();
    });
};
