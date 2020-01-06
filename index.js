const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const config = require('./server/config/config');
const socketEvents = require('./server/sockets/socketEvents');

// Start the server
const server = app.listen(config.port);

// set socket
const io = require('socket.io').listen(server);
socketEvents(io);

// Connect to the database
mongoose.connect(config.database);

app.use(express.static(path.join(__dirname + '/assets')));
app.set('clients', __dirname + '/clients');
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/clients/index.html');
});
app.get('/single-chat', function (req, res) {
    res.sendFile(__dirname + '/clients/single-chat.html');
});
app.get('/group-chat', function (req, res) {
    res.sendFile(__dirname + '/clients/group-chat.html');
});




