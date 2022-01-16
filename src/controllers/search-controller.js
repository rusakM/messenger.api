const mysql = require('mysql');
const {db, headers} = require('./../middlewares/config');
const log = require('./../middlewares/log');


const search = (req, res) => {
  const connection = mysql.createConnection(db);
  const { user, query } = req.body;

  const users = `SELECT userId, email, CONCAT_WS(" ", name, surname) AS name, photo 
    FROM users 
    WHERE (CONCAT_WS(" ", name, surname) LIKE "%${query}%" OR email LIKE "%${query}%")
    AND activated=1 
    AND userId != ${user}`;

  connection.query(users, (err, result, fields) => {
    if (err) throw err;

    res
      .set(headers)
      .json(result)
      .end();
    log(user, `Search: ${query}`);
    connection.destroy();
  });
};

module.exports = {
  search,
};
