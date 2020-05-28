

window.onresize = resizeContent;
window.onload = resizeContent; 

const video = document.getElementById("partyVideo");



let host = $('body').find("#host").length == 1;

//Don't want to mess around with timezones so just convert
//To AEST (need to add 10 hours)
function adjustTimestamp(timeStamp) {
  const components = timeStamp.split(':');
  let hours = parseInt(components[0]) + 10;
  if (hours > 12) {
    hours -= 12;
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (components[1].endsWith('am')) {
      return '' + hours + ':' + components[1].slice(0, 2) + 'pm';
    }
    return '' + hours + ':' + components[1].slice(0, 2) + 'am';
  }
  return '' + hours + ':' +  components[1];
}

function toggleSidebar() {
  const hamburger = $("#sidebarAnimate");
  const sidebar = $("#sidebar");
  const content = $("#content");

  const sidebar_width = 200 + 0.1;
  const width = document.body.clientWidth - sidebar_width;

  
  const videoWidth = width > 1000 ? 1000 : width;
  const videoMargin = width > 1000 ? (width - 1000) / 2 : 0;

  if ((sidebar).css('display') == 'none') {
    sidebar.css('display', 'block');
    hamburger.css('display', 'none');
    sidebar.animate({
      right: '0px'
    });
    content.animate({
      width: width + 'px'
    });
  } else {
    sidebar.animate({
      right: '-200px'
    });
    content.animate({
      width: '100vw'
    });
    sidebar.css('display', 'none');
    hamburger.css('display', 'block');
  }
  resizeContent();
}

function resizeContent() {
  if ($("#sidebar").css('display') != 'none') {
    const content = document.getElementById("content");
    const sidebar_width = 300 + 0.1;
    const width = document.body.clientWidth - sidebar_width;
    content.style.width = width + "px";
    const videoWidth = width > 1000 ? 1000 : width;
    const videoMargin = width > 1000 ? (width - 1000) / 2 : 0;
    console.log(videoWidth);
    video.style.width = (videoWidth - 10) + "px";
    video.style.height = ((videoWidth - 10) / 1.766) + "px"
    video.style.marginLeft = videoMargin + "px";
  } else {
    const content = document.getElementById("content");
    const sidebar_width = 0.1;
    const width = document.body.clientWidth - sidebar_width;
    content.style.width = width + "px";
    const videoWidth = width > 1000 ? 1000 : width;
    const videoMargin = width > 1000 ? (width - 1000) / 2 : 0;
    video.style.width = (videoWidth - 10) + "px";
    video.style.height = ((videoWidth - 10) / 1.766) + "px"
    video.style.marginLeft = videoMargin + 10 + "px";
  }
};

function checkAddMessage(e) {
  if(e && e.keyCode == 13) {
     const item = $("#messageBox button");
     sendMessage(item);
  }
}

window.onload = function() {
  window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  });
};

function sendMessage(elem) {
  const message = $(elem).prev().val();
  if (message != "") sendAction('message', message);
  $("#messageBox input").val("");
}

let adjustScrollPoint = true;

function adjustScroll() {
  const messageDiv = document.getElementById("messages");
  const scrolled = messageDiv.scrollTop + messageDiv.clientHeight
  const scrollable = messageDiv.scrollHeight
  //Don't animate if at the bottom obviously
  if (adjustScrollPoint && !((Math.abs(scrolled - scrollable)) < 20)) {
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
  console.log("Scrolling");
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
  }

  const html = `
    <p class="notifUsername">${notification.user}</p>
    <div class="message">
      <img src="/images/user-thumbs/${notification.imageURL}">
      <p class="messageContent">${message}</p>
      <p class="timeStamp">${adjustTimestamp(notification.formattedTimeSince)}</p>
      <p class="messageID">${notification.id}</p>
    </div>
  `
  $("#messages").append(html);
}

function pollForPartyUpdates() {

  const url = window.location.pathname + "/poll-for-updates";

  const lastNotificationID =  $("#messages .message").last().find(".messageID").text();

  let data = null;
  if (host) {
    data = { lastNotificationID, sync: video.currentTime + "," + video.paused};
  } else {
    data = { lastNotificationID };
  }

  $.ajax({
    url, type: "POST", data, dataType: 'json',
    success: function(response) {
      console.log(response);
      if (response.end) {
        window.location.pathname = "/watch-party/session-ended";
      }
      const notifications = response.notifications;
      if (response.host && !host) {
        video.controls = true;
        $("#messageHeader").append(`<a href=${window.location.pathname}/end-session>End Watch Party</a>`);
      } else if (!response.host && host) {
        $("#messageHeader").children()[1].remove();
      }
      host = response.host;

      if (!host) {
        check_sync(response.sync);
      }

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
    }
  })
  setTimeout(pollForPartyUpdates, 500);
  adjustScroll();
}

function check_sync(sync) {
  console.log("**********************************");
  const params = sync.split(',');
  const time = parseInt(params[0]);
  const playing = params[1] == 'true';
  console.log(time, playing);
  if (Math.abs(video.currentTime - time) > 2) {
    video.currentTime = time;
  }
}


pollForPartyUpdates();
resizeContent()