const Chat = require('../models/chat');
const SocketEvents = require('../config/config');

exports = module.exports = function(io) {
    var publicRooms = ['Default'];
    var privateRooms = [];
    var socketUsers = {};
    var users = [];
    var countChat = 0;

    //Set Listeners
    io.sockets.on( SocketEvents.connection, function (socket) {
        socket.emit(SocketEvents.updaterooms, publicRooms);
    
        // public room save
        socket.on(SocketEvents.publicRoomSave, function (roomName, callback) {
            if (publicRooms.includes(roomName)) {
                callback(false);
            } else {
                callback(true)
                publicRooms.push(roomName);
    
                socket.emit(SocketEvents.updaterooms, publicRooms);
                socket.broadcast.emit(SocketEvents.updaterooms, publicRooms);
            }
        })
        // private room save
        socket.on(SocketEvents.privateRoomSave, function (roomName, callback) {
            if (privateRooms.includes(roomName)) {
                if (publicRooms.includes(roomName)) {
                    callback(false);
                }
            } else {
                callback(true)
                privateRooms.push(roomName);
            }
    
        });
        // private room join
        socket.on(SocketEvents.privateRoomJoin, function (roomName, callback) {
            if (privateRooms.includes(roomName)) {
                callback(true);
            } else {
                callback(false)
            }
        })
    
    
        socket.on(SocketEvents.singleUser, function (data, callback) {
            var singleRoom = data[1] + Math.floor(countChat / 2);
            data = [data[0], singleRoom];
            if (isArrayInArray(users, data)) {
                callback('repeat');
            } else {
                callback('true');
                users.push(data);
                socket.nickname = data[0];
                socket.room = data[1];
                socketUsers[socket.nickname+'_'+socket.room] = socket;
                socket.join(data[1]);
                updateNicknames(data);
    
                // echo to client they've connected
                socket.emit(SocketEvents.updatechat, '🔵', 'you have connected to ' + singleRoom);
                // echo to selected group that a person has connected to their group
                socket.broadcast.to(data[1]).emit(SocketEvents.updatechat, '🔵', socket.nickname + ' has connected to this room');
            }
            countChat++;
        });
    
        socket.on(SocketEvents.newUser, function (data, callback) {
            if (isArrayInArray(users, data)) {
                callback(false);
            }
            else {
                callback(true);
                users.push(data);
                socket.nickname = data[0];
                socket.room = data[1];
                socketUsers[socket.nickname+'_'+socket.room] = socket;
                updateNicknames(data);
    
                // add the client's username to the global list
                // send client to selected group
                socket.join(data[1]);
    
                // old chat display
                Chat.find({ 'group': socket.room }, function (err, docs) {
                    if (err) throw err;
                    socket.emit(SocketEvents.loadOldMsgs, docs);
                })
    
                // echo to client they've connected
                socket.emit(SocketEvents.updatechat, '🔵', 'you have connected to ' + data[1]);
                // echo to selected group that a person has connected to their group
                socket.broadcast.to(data[1]).emit(SocketEvents.updatechat, '🔵', socket.nickname + ' has connected to this room');
            }
        })
    
        socket.on(SocketEvents.sendMessage, function (msg, blockList, callback) {
            var newMsg = new Chat({ nick: socket.nickname, group: socket.room, msg: msg });
            newMsg.save(function (err) {
                if (err) throw err;
                io.sockets.in(socket.room).emit(SocketEvents.newMessage, { nick: socket.nickname, group: socket.room, msg: msg , blockList: blockList })
            })
        });
    
        socket.on(SocketEvents.sendIndividualMessage, function (data, callback) {
            var senderKey = data[1] + '_' + socket.room;
            var socketId = socketUsers[senderKey].id;
            socket.broadcast.to(socketId).emit(SocketEvents.individualChat, {sender: socket.nickname, group: socket.room, reciever: data[1], msg: data[2]});
            socket.emit(SocketEvents.myChat, {sender: socket.nickname, group: socket.room, reciever: data[1], msg: data[2]});
        })
    
        socket.on(SocketEvents.disconnect, function (data) {
            if (!socket.nickname) return;
            for (i = 0; i < users.length; i++) {
                if (users[i][0] == socket.nickname) {
                    if (users[i][1] == socket.room) {
                        users.splice(i, 1)
                        break;
                    }
                }
            }
            // userlist update
            updateNicknames([socket.nickname, socket.room]);
            // echo globally that this client has left
            socket.broadcast.to(socket.room).emit(SocketEvents.updatechat, '🔴', socket.nickname + ' has disconnected');
            delete socketUsers[socket.nickname+'_'+socket.room];
    
            socket.leave(socket.room);
        });

        function isArrayInArray(arr, item) {
            var item_as_string = JSON.stringify(item);
        
            var contains = arr.some(function (ele) {
                return JSON.stringify(ele) === item_as_string;
            });
            return contains;
        }

        function updateNicknames(data) {
            var displayUsers = [];
            for (i = 0; i < users.length; i++) {
                if (users[i][1] == data[1]) {
                    displayUsers.push(users[i][0]);
                }
            }
            socket.broadcast.to(data[1]).emit(SocketEvents.usernames, displayUsers);
            socket.emit(SocketEvents.usernames, displayUsers);
        }
    });
  }