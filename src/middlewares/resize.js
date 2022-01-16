const sharp = require('sharp');
const fs = require('fs');
const log = require('./log');

const resizePhoto = (name) => {
  sharp(`public/photos/${name}.jpg`)
    .resize(360, 360, {
      fit: sharp.fit.cover,
    })
    .toFormat('jpeg')
    .jpeg({
      quality: 85,
    })
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(`public/photos/${name}.jpg`, data);
    })
    .catch((err) => {
      log(name, `Resizing photo error, photo: ${name}`);
    });
};

const resizeMessage = (userId, messageId) => {
  sharp(`public/messages/${messageId}.jpg`)
    .resize(900)
    .toFormat('jpeg')
    .jpeg({
      quality: 85,
    })
    .toBuffer()
    .then((data) => {
      fs.writeFileSync(`public/messages/${messageId}.jpg`, data);
    })
    .catch((err) => {
      log(userId, `Resizing message error, photo: ${messageId}`);
    });
};

module.exports = {
  resizePhoto,
  resizeMessage,
};
