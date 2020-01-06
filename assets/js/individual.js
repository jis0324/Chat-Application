var me = '';
var you = '';

$('.userWrap').on('click', '.user-select', function() {
    you = $(this).data('name');
    me = $('#me').val();
    $('#you').val(you);
    if (you != me) {
        $("#myModal .modal-header .modal-user").html(you);
        $("#myModal").css('display', 'block');
    }
});

$('#myModal .close').click(function() {
    $("#myModal").css('display', 'none');
});

// click send button
$('#individual_send').click(function (e) {
    if ($('#individual_message').val()) {
        you = $('#you').val();
        me = $('#me').val();
        console.log(you, me)
        e.preventDefault();
        socket.emit(socketEvents.sendIndividualMessage, [me, you, $('#individual_message').val()], function (data) {
            $chat.prepend('<span class="error">' + data + "</span><br/>");
        });
    }
    $('#individual_message').val('');
});

socket.on(socketEvents.individualChat, function(data) {
    $("#myModal .modal-header .modal-user").html(data.sender);
    $("#myModal").css('display', 'block');
    individualDisplayMsg([data.sender, data.msg]);
    $('#me').val(data.reciever);
    $('#you').val(data.sender);
});

socket.on(socketEvents.myChat, function(data) {
    individualDisplayMsg([data.sender, data.msg]);
});

function individualDisplayMsg(data) {
    $('#idividual_chat').prepend(
        '<div class="media">' +
        '<a class="pull-left" href="#">' +
        '<img class="media-object img-circle " src="img/user.png" style="width: 50px" />' +
        '</a>' +
        '<div class="media-body" >' +
        data[1] +
        '<br />' +
        '<small class="text-muted">' +
        data[0] +
        '</small>' +
        '<hr />' +
        '</div>' +
        '</div>'
    )
}
