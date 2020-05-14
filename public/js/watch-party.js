

window.onresize = resizeContent;
window.onload = resizeContent; 

const video = document.getElementById("partyVideo");
let host = $(video).attr('controls') == 'controls';

function resizeContent() {

  console.log("resizing content");
  //Get video and change dimensions
  const sidebar_width = 300 + 20; // padding
  const width = window.innerWidth - sidebar_width;
  video.style.width = width + "px";
  video.style.height = (width / 1.766) + "px"

};

window.onload = function() {
  window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  });
};

function sendMessage(elem) {
  sendAction('message', $(elem).prev().val());
  $("#messageBox input").val("");
}

let adjustScrollPoint = true;

function adjustScroll() {
  if (adjustScrollPoint) {
    scrollSmoothToBottom("messages");
  }
}

function scrollSmoothToBottom (id) {
  var div = document.getElementById(id);
  $('#' + id).animate({
     scrollTop: div.scrollHeight - div.clientHeight
  }, 500);
}

$("#messages").scroll(function() {
  const messageDiv = document.getElementById("messages");
  const scrolled = messageDiv.scrollTop + messageDiv.clientHeight
  const scrollable = messageDiv.scrollHeight
  adjustScrollPoint = (Math.abs(scrolled - scrollable)) < 20;

});

//Only allowed to send one seek request every 500ms
let onSeekCooldown = false;

function sendAction(type, info) {

  url = window.location.pathname;
  data = { type, info };

  if (type == 'seek') {
    if (onSeekCooldown) {
      return;
    } else {
      setTimeout(() => (onSeekCooldown = false), 500);
      onSeekCooldown = true;
    }
  }

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      console.log(response);
    }
  });
}

//Don't want a pause notification on seek: just pause after seek
let seeking = false;

video.onplay = () => {
  if (seeking) {
    return;
  }
  if (host) {
    sendAction('play', null);
  }
}

video.onpause = () => {
  if (video.seeking) {
    seeking = true;
    setTimeout(() => (seeking = false), 500)
    return;
  }
  if (seeking) {
    return;
  }
  if (host) {  
    sendAction('pause', null);
  }
}

video.onseeked = () => {
  if (host) {
    setTimeout(() => {
      video.pause();
      sendAction('seek', video.currentTime);
    }, 300);
  }
}

//Gets seconds, converts to minuetes:seconds
function formatTimeStamp(time) {
  
  console.log(time);

  time = Math.ceil(time);

  let hours = Math.floor(time / (60 * 60));
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (minutes < 10) {
    if (minutes != 0) minutes = "0" + minutes;
  }
  
  if (hours > 0) {
    return "" + hours + ':' + minutes + ':' + seconds;
  } else {
    return "" + minutes + ':' + seconds;
  }
}

function addNotification(notification) {
  let message = "";
  if (notification.type == 'play') {
    message = `${notification.user} started the video`;
  } else if (notification.type == 'pause') {
    message = `${notification.user} paused the video`;
  } else if (notification.type == 'seek') {
    message = `${notification.user} skipped the video to ${formatTimeStamp(notification.content)}`;
  } else if (notification.type == 'message') {
    message = notification.content;
  } else if (notification.type == 'joined') {
    message = `${notification.user} has joined the watch party`;
  } else if (notification.type == 'left') {
    message = `${notification.user} has left the watch party`;
  } else if (notification.type == 'host') {
    message = `${notification.user} has become the new host`;
  } else {
    console.log("What in the frikkity frik???!!!");
  }

  const html = `
    <div class="message">
      <img src="/images/user-thumbs/${notification.imageURL}">
      <p class="messageContent">${message}</p>
      <p class="timeStamp">${notification.formattedTimeSince}</p>
      <p class="messageID">${notification.id}</p>
    </div>
  `
  $("#messages").append(html);
}

function pollForPartyUpdates() {

  console.log("Polling for party updates");

  adjustScroll();

  const url = window.location.pathname + "/poll-for-updates";

  const lastNotificationID =  $("#messages .message").last().find(".messageID").text();
  console.log(lastNotificationID);

  let data = null;
  if (host) {
    data = { lastNotificationID, sync: video.currentTime + "," + video.paused};
  } else {
    data = { lastNotificationID };
  }

  $.ajax({
    url, type: "POST", data, dataType: 'json',
    success: function(response) {
      if (response.end) {
        window.location.pathname = "/watch-party/session-ended";
      }
      const notifications = response.notifications;
      if (response.host && !host) {
        video.controls = true;
        $("#messageHeader").append(`<a href=${window.location.pathname}/end-session>End Watch Party</a>`);
      } else if (!response.host && host) {
        video.controls = false;
        $("#messageHeader").children()[1].remove();
      }
      host = response.host;
      for (let i = 0; i < notifications.length; i++) {
        addNotification(notifications[i]);
        if (!response.admin) {
          const notification = notifications[i];
          //If you have become host, refresh the page
          if (notification.type == "pause") video.pause();
          if (notification.type == "play") video.play();
          if (notification.type == "seek") {
            video.currentTime = notification.content;
            video.pause();
          }
        }
      }
      if (response.sync) {
        const actions = response.sync.split(",");
        video.currentTime = parseInt(actions[0]);
        if (actions[1] == "true") {
          video.pause();
        } else {
          video.play();
        }
      }
    }
  })
  setTimeout(pollForPartyUpdates, 500);
}

pollForPartyUpdates();
resizeContent()