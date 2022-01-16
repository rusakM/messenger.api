const mysql = require('mysql');
const { db } = require('./config');

module.exports = (user, message) => {
  const time = new Date();
  const connection = mysql.createConnection(db);

  connection.query(
    `INSERT INTO logs (logId, userId, timestamp, action) VALUES (NULL, ${user}, "${time.getTime()}", "${message}")`,
    (err, result, fields) => {
      if (err) throw err;
      connection.destroy();
    },
  );
};
