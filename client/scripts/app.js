// YOUR CODE HERE:
$(document).ready(function () {

  window.app = {
    server: 'https://api.parse.com/1/classes/messages',
    firstFetch: true,
    allMsgs: {},
    rooms: {},
    selectedRoom: 'lobby',

    init: function () {
      app.fetch();
      setInterval(function () {
        app.fetch();
        // app.send({username: 'kyle', text: 'spam'});
      }, 2000);
    },

    send: function (message) {
      $.ajax({
      // This is the url you should use to communicate with the parse API server.
        url: 'https://api.parse.com/1/classes/messages',
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function (data) {
          console.log('chatterbox: Message sent');
        },
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message', data);
        }
      });
    },

    fetch: function () {
      $.ajax({
      // This is the url you should use to communicate with the parse API server.
        url: app.server,
        type: 'GET',
        data: {
          limit: 100,
          order: "-createdAt"
        },
        contentType: 'application/json',
        success: function (data) {
          app.fetchCompleted(data.results);
          console.log('chatterbox: Message fetched');
        },
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message', data);
        }
      });
    },

    fetchCompleted: function (messages) {
      messages.forEach(function (msg) {
        if (!app.allMsgs.hasOwnProperty(msg.createdAt)) {
          app.allMsgs[msg.createdAt] = msg;
          app.renderMessage(msg);
          // console.log(msg.text);
        }
      });
      app.firstFetch = false;

    },

    clearMessages: function () {
      $("#chats").empty();
    },

    renderMessage: function (message) {
      var $messageBox = $('<div class="messageBox"></div>');
      var $username = '<div class="username">' + filterXSS(message.username) + '</div>';
      var $message = '<div class="message">' + filterXSS(message.text) + '</div>';
      var $timeStamp = '<div class="timeStamp">' + message.createdAt + '</div>';
      
      // automatically set undefined rooms and empty string rooms to lobby
      if (message.roomname === '' || message.roomname === undefined) {
        var $room = '<div class="chatRoom">' + 'lobby' + '</div><br>';
        var roomname = 'lobby';
      } else {
        var roomname = message.roomname;
        var $room = '<div class="chatRoom">' + filterXSS(roomname) + '</div><br>';
      }

      // creating message box
      $messageBox.append($username);
      $messageBox.append($message);
      $messageBox.append($timeStamp);
      $messageBox.append($room);

      // creating list of unique rooms
      if (!app.rooms.hasOwnProperty(roomname)) {
        // var value = roomname.slice(0, roomname.indexOf(" "));
        var option = $('<option value=' + roomname + '>' + roomname + '</option>');
        $('#room-selector').append(option);
        app.rooms[roomname] = roomname;
      }

      // upon refreshing page, fetching only the first 100 messages
      if (app.firstFetch && app.selectedRoom === roomname) {
        $('#chats').append($messageBox);

      } else if (app.selectedRoom === roomname) {
        $('#chats').prepend($messageBox);      
      }
    },

    renderRoom: function () {

    }

  };

  $('#submit-text').on('click', function (event) {
    var text = $('#text-box').val();
    var userName = window.location.search.slice(window.location.search.indexOf("=") + 1);
    app.send({
      'text': text,
      'username': userName
    });
  });


  $('#roomButton').on('click', function (event) {
    app.clearMessages();
    app.selectedRoom = $('#room-selector option:selected').val();
    app.firstFetch = true;
    app.allMsgs = {};
    app.fetch();
  });

  app.init();

});


