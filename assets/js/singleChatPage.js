const socket = io.connect('http://localhost:8080');
const selectedRoom = '$singleChat';

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
            '<a class="pull-left" href="#">' +
            '<img class="media-object img-circle" style="max-height:40px;" src="img/user.png" />' +
            '</a>' +
            '<div class="media-body" >' +
            '<h5>' +
            '<p class="testi">' + users[i] + '</p>' +
            '</h5>' +
            '</div>';
        if (users[i] == $('#username').val()) {
            html += '<a href="/" class="logout" >logout</a>';
        }
        html += '</div>';
    }

    $('#users').html(html);

});

// click send button
$("#send").click(function (e) {
    if ($('#message').val()) {
        e.preventDefault();
        socket.emit(socketEvents.sendMessage, $('#message').val(), [], function (data) {
            $('#chat').prepend('<span class="error">' + data + "</span><br/>");
        });
    }
    $('#message').val('');
});

// update chat field
socket.on(socketEvents.updatechat, function (username, data) {
    $('#chat').prepend('<b>' + username + ':</b> ' + data + '<br>');
});

socket.on(socketEvents.newMessage, function (data) {
    displayMsg(data);
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

$('#setNick').submit(function (e) {
    if ($('#nickName').val() == '') {
        $('#nickName').css({ 'border': '1px solid red' });
        $('#nickError').html('You must input username. ');
        return false;
    } else {
        $('#username').val($('#nickName').val());
        $('#groupname').val(selectedRoom);
        e.preventDefault();
        socket.emit(socketEvents.singleUser, [$('#nickName').val(), selectedRoom], function (data) {
            if (data == 'true') {
                $('.nickWrap').hide();
                $('.userWrap').show();
                $('.contentWrap').show();
            } else if (data == 'repeat') {
                $('#nickError').html('User is already existing now! Please Try Again. ');
            }
        });
    }
    $('#nickName').css({ 'border-color': '#cccccc' });
    $('#nickName').val('');
});

