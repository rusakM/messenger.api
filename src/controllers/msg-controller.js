const mysql = require('mysql');
const fs = require('fs');
const { db, headers, pagination } = require('./../middlewares/config');
const log = require('./../middlewares/log');
// const setUserTimestamp = require('./../middlewares/user-timestamp');
const setChatTimestamp = require('./../middlewares/chat-timstamp');
const { resizeMessage } = require('../middlewares/resize');

const getChats = (req, res) => {
  const { user } = req.body;
  const connection = mysql.createConnection(db);

  const sql = `SELECT chats.chatId, usersAndTheirChats.name, latestMessagesByChats.timestamp AS msgTimestamp, chats.lastTimestamp AS chatTimestamp, latestMessagesByChats.messageId, messages.content, messages.type AS messageType, users.photo AS userPhoto, messages.isRead, users.isActive AS userIsActive, users.userId, messages.userId AS senderId
    FROM latestMessagesByChats, usersAndTheirChats, chats, userChat, messages, users 
    WHERE userChat.userId = ${user}
    AND chats.chatId = usersAndTheirChats.chatId 
    AND userChat.chatId = chats.chatId 
    AND usersAndTheirChats.chatId = chats.chatId 
    AND latestMessagesByChats.chatId = chats.chatId 
    AND usersAndTheirChats.userId != userChat.userId 
    AND messages.messageId = latestMessagesByChats.messageId 
    AND users.userId = usersAndTheirChats.userId 
    ORDER BY latestMessagesByChats.timestamp DESC`;

  connection.query(sql, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .json(result)
      .status(200)
      .end();
    connection.destroy();
  });
};

const getUserData = (req, res) => {
  const { user } = req.body;
  const connection = mysql.createConnection(db);

  connection.query(
    `SELECT CONCAT_WS(" ", name, surname) AS name, email, photo FROM users WHERE userId=${user}`,
    (err, result, fields) => {
      if (err) throw err;
      res
        .set(headers)
        .json(result[0])
        .status(200)
        .end();
      connection.destroy();
    },
  );
};

const getMessages = (req, res) => {
  const { user, chat, limit } = req.body;
  const connection = mysql.createConnection(db);

  let sql = `SELECT chatId, messageId, content, timestamp AS msgTimestamp, isRead, type AS messageType, userId AS senderId 
        FROM messages 
        WHERE chatId=${chat}
        AND (
            (userId=${user} AND senderCanSee=1)
            OR
            (userId!=${user} AND receiverCanSee=1)
        )
        ORDER BY messageId DESC
        LIMIT ${pagination}`;
  if (limit) {
    sql = `SELECT chatId, messageId, content, timestamp AS msgTimesamp, isRead, type AS messageType, userId senderId 
        FROM messages 
        WHERE chatId=${chat}
        AND (
            (userId=${user} AND senderCanSee=1)
            OR
            (userId!=${user} AND receiverCanSee=1)
        )
        AND messageId < ${limit}
        ORDER BY messageId DESC
        LIMIT ${pagination}`;
  }

  connection.query(sql, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .json(result)
      .status(200)
      .end();
    connection.destroy();
  });
};

const getLastMessageId = (req, res) => {
  const connection = mysql.createConnection(db);
  connection.query(
    'SELECT COUNT(*) AS count FROM messages',
    (err, result, fields) => {
      if (err) throw err;
      res
        .set(headers)
        .json(result[0])
        .status(200)
        .end();
      connection.destroy();
    },
  );
};

const getMessage = (req, res) => {
  const connection = mysql.createConnection(db);
  connection.query(
    `SELECT chatId, messageId, content, timestamp as msgTimestamp, isRead, type AS messageType, userId AS senderId 
    FROM messages WHERE messageId=${req.body.message}`,
    (err, result, fields) => {
      if (err) throw err;
      res
        .set(headers)
        .json(result)
        .status(200)
        .end();
      connection.destroy();
    },
  );
};

const sendMessage = (req, res) => {
  const { content, messageType, senderId, chatId } = req.body;

  const connection = mysql.createConnection(db);
  const timeNow = new Date();
  const timestamp = timeNow.getTime();
  const sql = `INSERT INTO messages 
    (messageId, chatId, content, timestamp, isRead, type, senderCanSee, receiverCanSee, userId)
    VALUES (NULL, ${chatId}, '${content}', "${timestamp}", 0, ${messageType}, 1, 1, ${senderId})`;

  connection.query(sql, (err, result, fields) => {
    if (err) throw err;
    if (req.file) {
      log(senderId, `Send photo, id: ${result.insertId}`);
      fs.rename(
        req.file.path,
        `public/messages/${result.insertId}.jpg`,
        (err) => {
          if (err) throw err;
          resizeMessage(senderId, result.insertId);
          res
            .set(headers)
            .json({
              chatId,
              messageId: result.insertId,
              content,
              msgTimestamp: timestamp,
              isRead: 0,
              messageType: parseInt(messageType, 10),
              senderId,
            })
            .status(200)
            .end();
          connection.destroy();
        },
      );
    } else {
      log(senderId, `Send message, id: ${result.insertId}`);
      res
        .set(headers)
        .json({
          chatId,
          messageId: result.insertId,
          content,
          msgTimestamp: timestamp,
          isRead: 0,
          messageType: parseInt(messageType, 10),
          senderId,
        })
        .status(200)
        .end();
      connection.destroy();
    }
    setChatTimestamp(chatId);
  });
};

const startChat = (req, res) => {
  const { first, second } = req.body;
  const connection = mysql.createConnection(db);
  const timeNow = new Date();

  connection.query(
    `INSERT INTO chats (chatId, lastTimestamp) VALUES (NULL, "${timeNow.getTime()}")`,
    (err, result, fields) => {
      if (err) throw err;
      const { insertId } = result;
      const timestamp = new Date();
      // res.set(headers).json(result).end();
      // connection.destroy();

      connection.query(
        `INSERT INTO userChat (userChatId, userId, chatId) 
            VALUES (NULL, ${first}, ${insertId}),
            (NULL, ${second}, ${insertId})`,
        (err, results, fields) => {
          if (err) throw err;
          connection.query(
            `INSERT INTO messages (messageId, chatId, content, timestamp, isRead, type, senderCanSee, receiverCanSee, userId)
            VALUES (NULL, ${insertId}, "Hello!", ${timestamp.getTime()}, 0, 0, 1, 1, ${first})`,
            (err, result, fields) => {
              if (err) throw err;
              res
                .set(headers)
                .json({ chatId: insertId })
                .status(200)
                .end();
              connection.destroy();
            },
          );
        },
      );
    },
  );
};

const setViewed = (req, res) => {
  if (!req.query.userId || !req.query.chatId) {
    res
      .set(headers)
      .status(404)
      .end();
    return;
  }
  const { userId, chatId } = req.query;
  const connection = mysql.createConnection(db);
  const query = `UPDATE messages SET isRead = 1 WHERE chatId = ${chatId} AND userId != ${userId} AND isRead = 0`;
  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .status(200)
      .end();
    connection.destroy();
    setChatTimestamp(chatId);
  });
};

const checkNewMessages = (req, res) => {
  if (!req.query.chatId || !req.query.messageId) {
    res
      .set(headers)
      .status(404)
      .end();
    return;
  }
  const { chatId, messageId } = req.query;
  const connection = mysql.createConnection(db);
  const query = `SELECT COUNT(*) AS count FROM messages WHERE messageId > ${messageId} AND chatId = ${chatId}`;

  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    connection.query(
      `SELECT messageId AS lastRead FROM messages WHERE isRead = 1 AND chatId = ${chatId} ORDER BY messageId DESC LIMIT 1`,
      (e, r, f) => {
        if (e) throw e;
        let lastRead = 0;
        if (r.length > 0) {
          lastRead = r[0].lastRead;
        }
        res
          .set(headers)
          .json({
            count: result[0].count,
            lastRead,
          })
          .status(200)
          .end();
        connection.destroy();
      },
    );
  });
};

const getNewMessages = (req, res) => {
  if (!req.query.chatId || !req.query.messageId) {
    res
      .set(headers)
      .status(404)
      .end();
    return;
  }
  const connection = mysql.createConnection(db);
  const { chatId, messageId } = req.query;
  const query = `SELECT chatId, messageId, content, timestamp AS msgTimestamp, isRead, type AS messageType, userId AS senderId 
  FROM messages WHERE messageId > ${messageId} AND chatId = ${chatId}`;

  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .json(result)
      .status(200)
      .end();
    connection.destroy();
  });
};

const checkUpdates = (req, res) => {
  if (!req.query.userId || !req.query.timestamp) {
    res
      .set(headers)
      .status(404)
      .end();
    return;
  }
  const connection = mysql.createConnection(db);
  const { userId, timestamp } = req.query;
  const query = `SELECT COUNT(*) AS updates FROM usersAndTheirChats WHERE userId=${userId} AND timestamp > "${timestamp}"`;

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

const getNotification = (req, res) => {
  if (!req.query.timestamp || !req.query.userId) {
    res
      .set(headers)
      .status(404)
      .end();
    return;
  }
  const connection = mysql.createConnection(db);
  const { timestamp, userId } = req.query;
  const query = `SELECT messages.chatId, messages.userId, messages.content, CONCAT_WS(" ", users.name, users.surname) AS name, messages.messageId 
  FROM users, messages, usersAndTheirChats 
  WHERE users.userId = messages.userId 
  AND usersAndTheirChats.userId = ${userId}
  AND messages.chatId = usersAndTheirChats.chatId 
  AND messages.userId != ${userId}
  AND messages.timestamp > "${timestamp}"
  ORDER BY messages.messageId DESC LIMIT 1`;

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

const checkNotifications = (req, res) => {
  if (!req.query.userId || !req.query.timestamp) {
    res
      .set(headers)
      .status(404)
      .end();
    return;
  }
  const { userId, timestamp } = req.query;
  const connection = mysql.createConnection(db);
  const query = `SELECT COUNT(*) AS count FROM messages, users, usersAndTheirChats 
  WHERE usersAndTheirChats.userId = ${userId} 
  AND messages.userId = users.userId
  AND usersAndTheirChats.chatId = messages.chatId
  AND messages.timestamp > "${timestamp}"
  AND messages.userId != ${userId}`;

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

const getFirstMessageId = (req, res) => {
  if (!req.query.chatId) {
    res
      .set(headers)
      .json({ id: 0 })
      .end();
  }
  const connection = mysql.createConnection(db);
  const query = `SELECT messageId FROM messages WHERE chatId = ${req.query.chatId} ORDER BY messageId ASC LIMIT 1`;

  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    res
      .set(headers)
      .json({
        id: result[0].messageId,
      })
      .status(200)
      .end();
    connection.destroy();
  });
};

module.exports = {
  getChats,
  getUserData,
  getMessages,
  getLastMessageId,
  getMessage,
  sendMessage,
  startChat,
  setViewed,
  checkNewMessages,
  getNewMessages,
  checkUpdates,
  getNotification,
  checkNotifications,
  getFirstMessageId,
};
