var socket = io.connect('http://localhost:8080');
var selectedRoom = '';
var blockList = [];

$(function () {
    // when the client clicks SEND
    $('#chat').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            $('#send').focus().click();
        }
    });
});

socket.on(socketEvents.usernames, function (users) {
    var html = ''
    for (i = 0; i < users.length; i++) {
        html += '<div class="media" style="display: flex; justify-content: space-between">' +
            '<div class="display-flex user-select" data-name="' + users[i] + '">' +
            '<img class="media-object img-circle" style="max-height:40px; margin-right:20px;" src="img/user.png" />' +
            '<div class="media-body" >' +
            '<h5>' +
            '<p class="testi">' + users[i] + '</p>' +
            '</h5>' +
            '</div></div>';
        if (users[i] == $('#username').val()) {
            html += '<a href="/" class="logout" >logout</a>';
        } else {
            html += '<a class="block-user unblock" data-name="' + users[i] + '">block</a>';
        }
        html += '</div>';
    }

    $('#users').html(html);

});

// click send button
$("#send").click(function (e) {
    if ($('#message').val()) {
        e.preventDefault();
        socket.emit(socketEvents.sendMessage, $('#message').val(), blockList, function (data) {
            $('#chat').prepend('<span class="error">' + data + "</span><br/>");
        });
    }
    $('#message').val('');
});

$("#users").on('click', '.block-user', function () {
    if ($(this).hasClass('unblock')) {
        $(this).html('unblock');
        blockList.push($(this).data('name'));
        $(this).removeClass('unblock');
        $(this).addClass('block');
    } else if ($(this).hasClass('block')) {
        $(this).html('block');
        $(this).removeClass('block');
        $(this).addClass('unblock');
        blockList = arrayRemove(blockList, $(this).data('name'));
    }

})

function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });

}

// update chat field
socket.on(socketEvents.updatechat, function (username, data) {
    $('#chat').prepend('<b>' + username + ':</b> ' + data + '<br>');
});

socket.on(socketEvents.newMessage, function (data) {
    var sel_blockList = data.blockList;
    if (!sel_blockList.includes($('#username').val())) {
        $('#chat').prepend(
            '<div class="media">' +
            '<a class="pull-left" href="#">' +
            '<img class="media-object img-circle " src="img/user.png" style="width: 50px" />' +
            '</a>' +
            '<div class="media-body" >' +
            data.msg +
            '<br />' +
            '<small class="text-muted">' +
            data.nick +
            '</small>' +
            '<hr />' +
            '</div>' +
            '</div>'
        )
    }
})

function displayMsg(data) {
    $('#chat').prepend(
        '<div class="media">' +
        '<a class="pull-left" href="#">' +
        '<img class="media-object img-circle " src="img/user.png" style="width: 50px" />' +
        '</a>' +
        '<div class="media-body" >' +
        data.msg +
        '<br />' +
        '<small class="text-muted">' +
        data.nick +
        '</small>' +
        '<hr />' +
        '</div>' +
        '</div>'
    )
}

socket.on(socketEvents.loadOldMsgs, function (docs) {
    for (var i = 0; i < docs.length; i++) {
        displayMsg(docs[i]);
    }
})

function switchRoom(room) {
    $('#rooms a').removeClass('btn-roomin');
    $('#rooms .' + room).addClass('btn-roomin');
    $('.nickWrap').show();
    selectedRoom = room;
}

$('#setNick').submit(function (e) {
    if ($('#nickName').val() == '') {
        $('#nickName').css({ 'border': '1px solid red' });
        $('#nickError').html('You must input username. ');
        return false;
    } else {
        $('#me').val($('#nickName').val());
        $('#username').val($('#nickName').val());
        $('#groupname').val(selectedRoom);
        e.preventDefault();
        socket.emit(socketEvents.newUser, [$('#nickName').val(), selectedRoom], function (data) {
            if (data) {
                $('.sel-room').hide();
                $('.nickWrap').hide();
                $('.userWrap').show();
                $('.contentWrap').show();
                // window.location.href = "/group-chat/chat-box";
            } else {
                $('#nickError').html('There is user that have this username in this group! Please Try Again. ');
            }
        });
    }

    $('#nickName').val('');
});

// public group create
$('#public_group_add').click(function () {
    $('#private_group_add_div').css("display", "none");
    $('#private_group_join_div').css("display", "none");
    $('#public_group_add_div').css("display", "flex");

});
// public group save
$('#public_group_add_btn').click(function () {
    var public_group_name = $('#public_group_name').val();
    if (public_group_name != "") {
        socket.emit(socketEvents.publicRoomSave, public_group_name, function (data) {
            if (data) {
                $('#public_group_name').css("border", "1px solid #cccccc");
                $('#roomError').html('');
                $('#public_group_add_div').hide();
            } else {
                $('#roomError').html('That roomname is already taken! Please Try Again. ');
            }
        })
        $('#public_group_name').val('');
    } else {
        $('#public_group_name').css("border", "1px solid red");
    }
});
//public group create cancel
$('#public_group_add_can').click(function () {
    $('#roomError').html('');
    $('#public_group_name').val('');
    $('#public_group_add_div').hide();
    $('#public_group_name').css("border", "1px solid #cccccc");
});

// Private group create
$('#private_group_add').click(function () {
    $('#public_group_add_div').css("display", "none");
    $('#private_group_join_div').css("display", "none");
    $('#private_group_add_div').css("display", "flex");

});
// private group save
$('#private_group_add_btn').click(function () {
    var private_group_name = $('#private_group_name').val();
    if (private_group_name != "") {
        socket.emit(socketEvents.privateRoomSave, private_group_name, function (data) {
            if (data) {
                $('#private_group_name').css("border", "1px solid #cccccc");
                $('#roomError').html('');
                $('#private_group_add_div').hide();
                $('.nickWrap').show();
                selectedRoom = private_group_name;
            } else {
                $('#roomError').html('That roomname is already taken! Please Try Again. ');
            }
        })
        $('#private_group_name').val('');
    } else {
        $('#private_group_name').css("border", "1px solid red");
    }
});
//private group create cancel
$('#private_group_add_can').click(function () {
    $('#roomError').html('');
    $('#private_group_name').val('');
    $('#private_group_add_div').hide();
    $('#private_group_name').css("border", "1px solid #cccccc");
});

// private group join
$('#private_group_join').click(function () {
    $('#public_group_add_div').css("display", "none");
    $('#private_group_add_div').css("display", "none");
    $('#private_group_join_div').css("display", "flex");

});
// private group save
$('#private_group_join_btn').click(function () {
    var private_group_join_name = $('#private_group_join_name').val();
    if (private_group_join_name != "") {
        socket.emit('privateRoomJoin', private_group_join_name, function (data) {
            if (data) {
                $('#private_group_join_name').css("border", "1px solid #cccccc");
                $('#roomError').html('');
                $('#private_group_join_div').hide();
                $('.nickWrap').show();
                selectedRoom = private_group_join_name;
            } else {
                $('#roomError').html('That room dosen\'t exist! Please Try Again. ');
            }
        })
        $('#private_group_join_name').val('');
    } else {
        $('#private_group_join_name').css("border", "1px solid red");
    }
});
//private group create cancel
$('#private_group_join_can').click(function () {
    $('#roomError').html('');
    $('#private_group_name').val('');
    $('#private_group_join_div').hide();
    $('#private_group_name').css("border", "1px solid #cccccc");
});
// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on(socketEvents.updateRooms, function (rooms) {
    $('#rooms').empty();
    $.each(rooms, function (key, value) {
        $('#rooms').prepend('<div><a href="#"  class="btn btn-success ' + value + '"  style="width:100px; margin-bottom: 10px" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>');
    });
});

