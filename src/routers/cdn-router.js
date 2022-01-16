const { Router } = require('express');
const multer = require('multer');
const Cdn = require('./../controllers/cdn-controller');

const upload = multer({ dest: `${process.cwd()}/public/photos` });

module.exports = () => {
  const app = Router();

  app.get('/photo/:id', Cdn.getPhoto);

  app.get('/message/:id', Cdn.getMessage);

  app.get('/deletePhoto', Cdn.deletePhoto);

  app.post('/savePhoto', upload.single('photo'), Cdn.savePhoto);

  return app;
};
