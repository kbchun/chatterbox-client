// YOUR CODE HERE:
$(document).ready(function () {

  window.app = {
    server: 'https://api.parse.com/1/classes/messages',
    firstFetch: true,
    allMsgs: {},
    rooms: {},
    selectedRoom: 'lobby',
    users: {},

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
        }
      });
      app.firstFetch = false;

    },

    clearMessages: function () {
      $("#chats").empty();
    },

    renderMessage: function (message) {
      var $messageBox = $('<div class="messageBox"></div>');
      var $username = '<div class="username ' + filterXSS(message.username) + '"onClick=app.handleUsernameClick.call(this)>' + filterXSS(message.username) + '</div>';
      var $message = '<div class="message">' + filterXSS(message.text) + '</div>';
      var $timeStamp = '<div class="timeStamp">' + message.createdAt + '</div>';
      
      // automatically set undefined rooms and empty string rooms to lobby
      if (message.roomname === '' || message.roomname === undefined) {
        var $room = '<div class="chatRoom">' + 'lobby' + '</div><br>';
        var roomname = 'lobby';
      } else {
        var roomname = filterXSS(message.roomname);
        var $room = '<div class="chatRoom">' + filterXSS(roomname) + '</div><br>';
      }

      // creating message box
      $messageBox.append($username);
      $messageBox.append($message);
      $messageBox.append($timeStamp);
      $messageBox.append($room);

      // creating list of unique rooms
      if (!app.rooms.hasOwnProperty(roomname)) {
        var option = $('<option value=' + roomname + '>' + roomname + '</option>');
        $('#room-selector').append(option);
        app.rooms[roomname] = roomname;
      }

      // upon refreshing page, fetching only the first 100 messages
      if (app.firstFetch && app.selectedRoom === roomname) {
        $('#chats').append($messageBox);

      // get new messages live
      } else if (app.selectedRoom === roomname) {
        $('#chats').prepend($messageBox);      
      }

      // checks if user is a friend; if so, bold their messages (!!!! currently just name is bolded)
      if (app.users.hasOwnProperty(message.username)) {
        $("." + message.username).addClass('bold');
      }
    },

    renderRoom: function () {

    },

    handleUsernameClick: function() {
      var name = this.textContent;
      $("." + name).addClass('bold');
      if (!app.users.hasOwnProperty(name)) {
        app.users[name] = name;
      } 
    }

  };

  $('#submit-text').on('click', function (event) {
    var text = $('#text-box').val();
    var username = window.location.search.slice(window.location.search.indexOf("=") + 1);
    app.send({
      'text': text,
      'username': username
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


