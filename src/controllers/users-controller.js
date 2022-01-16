/* eslint-disable no-use-before-define */
const mysql = require('mysql');
const mailer = require('../middlewares/send-mail');
const { db, links, headers } = require('./../middlewares/config');
const log = require('./../middlewares/log');

const login = (req, res) => {
  const connection = mysql.createConnection(db);

  connection.query(
    `SELECT userId, activated FROM users WHERE email="${req.body.email}" AND password="${req.body.password}"`,
    (err, result, fields) => {
      if (err) throw err;

      res.set(headers);
      if (result.length === 1) {
        if (result[0].activated === 1) {
          res
            .json({
              loginStatus: 1,
              user: result[0].userId,
            })
            .end();
          log(result[0].userId, 'Login');
          setActive(result[0].userId);
        } else {
          res
            .json({
              loginStatus: 0,
            })
            .end();
        }
      } else {
        res
          .json({
            loginStatus: -1,
          })
          .end();
      }
      connection.destroy();
    },
  );
};

const logout = (req, res) => {
  const connection = mysql.createConnection(db);
  const time = new Date();
  const { user } = req.body;

  connection.query(
    `UPDATE users SET isActive=0, lastSeen="${time.getTime()}" WHERE userId=${user}`,
    (err, result, fields) => {
      if (err) throw err;

      res
        .set(headers)
        .status(200)
        .end();
      log(user, 'Logout');
      connection.destroy();
    },
  );
};

const setActive = (user) => {
  const connection = mysql.createConnection(db);

  connection.query(
    `UPDATE users SET isActive=1 WHERE userId=${user}`,
    (err, result, fields) => {
      if (err) throw err;
      connection.destroy();
    },
  );
};

const register = (req, res) => {
  const { email, password, name, surname } = req.body;

  if (!email || !password || !name || !surname) {
    res
      .set(headers)
      .json({
        registerStatus: -1,
      })
      .status(200)
      .end();
  }
  const connection = mysql.createConnection(db);
  const query1 = `SELECT userId FROM users WHERE email="${email}"`;
  const query2 = `INSERT INTO users (userId, email, password, name, surname, isActive, lastSeen, photo, activated) 
  VALUES (NULL, "${email}", "${password}", "${name}", "${surname}", 0, 0, 0, 0)`;

  connection.query(query1, (err, result, fields) => {
    if (err) throw err;
    if (result.length === 0) {
      connection.query(query2, (e, r, f) => {
        if (e) throw e;
        mailer.sendRegisterMail(email, r.insertId, `${name} ${surname}`);
        res
          .set(headers)
          .json({ registerStatus: 1 })
          .status(200)
          .end();
        connection.destroy();
      });
    } else {
      res
        .set(headers)
        .json({ registerStatus: 0 })
        .status(200)
        .end();
      connection.destroy();
    }
  });
};

const confirm = (req, res) => {
  const userId = req.params.id;
  const connection = mysql.createConnection(db);

  connection.query(
    `UPDATE users SET activated=1 WHERE userId=${userId}`,
    (err, result, fields) => {
      if (err) throw err;

      res
        .set(headers)
        .status(200)
        .send(
          `<h2>Account is activated</h2><br><a href="${links.frontend}/login">Login here</a>`,
        )
        .end();

      log(userId, 'Account activated');
      connection.destroy();
    },
  );
};

const fetchUserData = (req, res) => {
  if (!req.query.userId) {
    res
      .set(headers)
      .status(404)
      .end();
  }
  const connection = mysql.createConnection(db);
  const query = `SELECT email, name, surname, password, photo FROM users WHERE userId=${req.query.userId}`;
  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .json(result[0])
      .status(200)
      .end();
    connection.destroy();
  });
};

const changePassword = (req, res) => {
  const connection = mysql.createConnection(db);
  const query = `UPDATE users SET password="${req.body.password}" WHERE userId=${req.body.userId}`;

  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .status(200)
      .end();
    log(req.body.userId, 'Password changed');
    connection.destroy();
  });
};

const disableAccount = (req, res) => {
  if (!req.query.userId) {
    res
      .set(headers)
      .status(404)
      .end();
  }
  const connection = mysql.createConnection(db);
  const query = `UPDATE users SET activated=0 WHERE userId = ${req.query.userId}`;

  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    connection.query(
      `SELECT CONCAT_WS(' ', name, surname) AS name, email FROM users WHERE userId = ${req.query.userId}`,
      (e, r, f) => {
        if (e) throw e;
        mailer.sendDisableMail(r[0].email, req.query.userId, r[0].name);
        res
          .set(headers)
          .status(200)
          .end();
        connection.destroy();
      },
    );
  });
};

module.exports = {
  login,
  logout,
  register,
  confirm,
  fetchUserData,
  changePassword,
  disableAccount,
};
