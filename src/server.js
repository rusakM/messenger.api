const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const api = require('./routers/router');
const cdn = require('./routers/cdn-router');
const { port } = require('./middlewares/config');

const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/api', api());
app.use('/cdn', cdn());

const server = http.createServer(app);

server.listen(port, () => console.log(`Server is running on port: ${port}`));
