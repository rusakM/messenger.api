const fs = require('fs');
const mysql = require('mysql');
const { headers, db } = require('./../middlewares/config');
const log = require('../middlewares/log');
const { resizePhoto } = require('../middlewares/resize');

const avatar = `${process.cwd()}/public/photos/avatar.png`;

const getPhoto = (req, res) => {
  const { id } = req.params;
  const link = `${process.cwd()}/public/photos/${id}.jpg`;
  if (fs.existsSync(link)) {
    fs.readFile(link, (err, data) => {
      if (err) console.log(err);
      res.set(headers);
      res.write(data);
      res.status(200);
      res.end();
    });
  } else {
    fs.readFile(avatar, (err, data) => {
      res.set(headers);
      res.write(data);
      res.status(200);
      res.end();
    });
  }
};

const getMessage = (req, res) => {
  const { id } = req.params;
  const link = `${process.cwd()}/public/messages/${id}.jpg`;
  if (fs.existsSync(link)) {
    fs.readFile(link, (err, data) => {
      if (err) console.log(err);
      res.set(headers);
      res.write(data);
      res.status(200);
      res.end();
    });
  } else {
    fs.readFile(avatar, (err, data) => {
      res.set(headers);
      res.write('Fetch photo error');
      res.status(200);
      res.end();
    });
  }
};

const savePhoto = (req, res) => {
  fs.rename(req.file.path, `public/photos/${req.body.userId}.jpg`, (err) => {
    if (err) throw err;
    resizePhoto(req.body.userId);
    const connection = mysql.createConnection(db);
    connection.query(
      `UPDATE users SET photo=1 WHERE userId=${req.body.userId}`,
      (err, result, fields) => {
        if (err) throw err;
        res
          .set(headers)
          .status(200)
          .end();
        log(req.body.userId, 'User photo changed');
      },
    );
  });
};

const deletePhoto = (req, res) => {
  if (!req.query.userId) {
    res
      .set(headers)
      .status(404)
      .end();
  }
  const connection = mysql.createConnection(db);
  const path = `public/photos/${req.query.userId}.jpg`;
  const query = `UPDATE users SET photo = 0 WHERE userId = ${req.query.userId}`;

  fs.unlink(path, () => {
    connection.query(query, (err, result, fields) => {
      if (err) throw err;
      res
        .set(headers)
        .status(200)
        .end();
      log(req.query.userId, 'User photo deleted');
      connection.destroy();
    });
  });
};

module.exports = {
  getPhoto,
  getMessage,
  savePhoto,
  deletePhoto,
};
