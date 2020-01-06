const mongoose = require('mongoose');

// Creates chat schema

const ChatSchema = new mongoose.Schema({
    nick: String,
    msg: String,
    group: String,
    created: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', ChatSchema);
